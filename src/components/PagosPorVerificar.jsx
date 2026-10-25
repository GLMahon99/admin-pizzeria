import { useState, useEffect, useRef } from 'react';
import { Landmark, CheckCircle2, XCircle, Clock, Bell, BellOff, AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig';

const hora = (iso) => (iso
    ? new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' })
    : null);
const fecha = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' });
const esHoy = (iso) => new Date(iso).toDateString() === new Date().toDateString();

const CLAVE_SONIDO = 'acommerr_sonido_transferencias';
const leerSonido = () => {
    try { return localStorage.getItem(CLAVE_SONIDO) === '1'; } catch { return false; }
};
const guardarSonido = (activo) => {
    try { localStorage.setItem(CLAVE_SONIDO, activo ? '1' : '0'); } catch { /* sin almacenamiento: solo dura esta sesión */ }
};

// Dos tonos cortos. El navegador solo deja reproducir audio después de un clic, por eso el botón "Activar sonido".
let audioCtx = null;
const sonarAviso = () => {
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        [880, 1320].forEach((frecuencia, i) => {
            const inicio = audioCtx.currentTime + i * 0.18;
            const osc = audioCtx.createOscillator();
            const vol = audioCtx.createGain();
            osc.frequency.value = frecuencia;
            vol.gain.setValueAtTime(0.0001, inicio);
            vol.gain.exponentialRampToValueAtTime(0.25, inicio + 0.02);
            vol.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);
            osc.connect(vol).connect(audioCtx.destination);
            osc.start(inicio);
            osc.stop(inicio + 0.17);
        });
    } catch { /* navegador sin Web Audio */ }
};

/**
 * Pagos por transferencia pendientes de verificar.
 * El local busca el ingreso en su banco por monto, hora y titular, y confirma o rechaza.
 */
const PagosPorVerificar = ({ pedidos, onCambio }) => {
    const [procesando, setProcesando] = useState(null);
    const [sonido, setSonido] = useState(leerSonido);
    const avisadosVistos = useRef(null); // ids de 'Transferencia informada' ya vistos (null = primera carga)

    // Primero los que ya avisaron (por hora de aviso), después los que todavía no avisaron
    const informados = pedidos
        .filter(p => p.metodo_pago === 'transferencia' && p.estado === 'Transferencia informada')
        .sort((a, b) => new Date(a.transf_informada_en) - new Date(b.transf_informada_en));
    const esperando = pedidos
        .filter(p => p.metodo_pago === 'transferencia' && p.estado === 'Esperando transferencia')
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const lista = [...informados, ...esperando];

    // Mismo monto en más de un pedido: hay que mirar bien el titular y la hora antes de confirmar
    const vecesPorMonto = lista.reduce((acc, p) => {
        const monto = Number(p.total);
        acc[monto] = (acc[monto] || 0) + 1;
        return acc;
    }, {});

    const idsInformados = informados.map(p => p.id_pedido).join(',');

    // Suena cuando un cliente avisa que transfirió (no en la primera carga de la página)
    useEffect(() => {
        const ids = idsInformados ? idsInformados.split(',') : [];
        const vistos = avisadosVistos.current;
        avisadosVistos.current = new Set(ids);
        if (vistos && sonido && ids.some(id => !vistos.has(id))) sonarAviso();
    }, [idsInformados, sonido]);

    // Contador en el título de la pestaña, para verlo aunque esté en otra pestaña
    const cantidadInformados = informados.length;
    useEffect(() => {
        const base = document.title.replace(/^\(\d+\) /, '');
        document.title = cantidadInformados > 0 ? `(${cantidadInformados}) ${base}` : base;
        return () => { document.title = document.title.replace(/^\(\d+\) /, ''); };
    }, [cantidadInformados]);

    const alternarSonido = () => {
        const activo = !sonido;
        setSonido(activo);
        guardarSonido(activo);
        if (activo) sonarAviso(); // de paso confirma que se escucha
    };

    if (lista.length === 0) return null;

    const confirmar = async (p) => {
        const titular = p.transf_titular_origen || p.cliente_nombre || '-';
        if (!window.confirm(`¿Confirmás que recibiste $${Number(p.total).toLocaleString('es-AR')} de ${titular}? El pedido #${p.id_pedido} pasa a preparación.`)) return;
        try {
            setProcesando(p.id_pedido);
            await api.post(`/pedidos/${p.id_pedido}/confirmar-pago`, {});
            onCambio();
        } catch (error) {
            alert(error.response?.data?.message || 'No se pudo confirmar el pago.');
        } finally {
            setProcesando(null);
        }
    };

    const rechazar = async (p) => {
        const nota = window.prompt(`Pedido #${p.id_pedido}: el cliente va a ver que no se pudo confirmar el pago y un botón para escribirte por WhatsApp.\n\nNota interna (opcional, no la ve el cliente):`, '');
        if (nota === null) return; // canceló
        try {
            setProcesando(p.id_pedido);
            await api.post(`/pedidos/${p.id_pedido}/rechazar-pago`, { nota });
            onCambio();
        } catch (error) {
            alert(error.response?.data?.message || 'No se pudo actualizar el pago.');
        } finally {
            setProcesando(null);
        }
    };

    return (
        <section className="bg-white rounded-[2rem] border-2 border-emerald-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-emerald-50 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-black text-emerald-900 flex items-center gap-2">
                    <Landmark size={18} /> Pagos por verificar
                    <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">{informados.length}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-bold text-emerald-800">Buscá cada ingreso en tu banco por monto, hora y titular.</p>
                    <button
                        type="button"
                        onClick={alternarSonido}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${sonido ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}
                    >
                        {sonido ? <Bell size={13} /> : <BellOff size={13} />} {sonido ? 'Sonido activado' : 'Activar sonido'}
                    </button>
                </div>
            </div>
            <ul className="divide-y divide-gray-100">
                {lista.map(p => {
                    const avisado = p.estado === 'Transferencia informada';
                    return (
                        <li key={p.id_pedido} className="px-6 py-4 flex flex-col 2xl:flex-row 2xl:items-center gap-3 2xl:gap-6">
                            <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido</p>
                                    <p className="font-black text-gray-800">#{p.id_pedido}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</p>
                                    <p className="font-black text-gray-900 text-lg tracking-tight">${Number(p.total).toLocaleString('es-AR')}</p>
                                    {vecesPorMonto[Number(p.total)] > 1 && (
                                        <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md mt-0.5" title="Hay otro pedido por el mismo monto: fijate el titular y la hora en tu banco.">
                                            <AlertTriangle size={11} /> Monto repetido
                                        </p>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Titular</p>
                                    <p className="font-bold text-gray-800 truncate" title={p.transf_titular_origen || p.cliente_nombre}>
                                        {p.transf_titular_origen || p.cliente_nombre || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{avisado ? 'Avisó' : 'Pedido'}</p>
                                    <p className="font-bold text-gray-800">
                                        {esHoy(avisado ? p.transf_informada_en : p.fecha) ? '' : `${fecha(avisado ? p.transf_informada_en : p.fecha)} `}
                                        {hora(avisado ? p.transf_informada_en : p.fecha)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {!avisado && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                                        <Clock size={12} /> Todavía no avisó
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => confirmar(p)}
                                    disabled={procesando === p.id_pedido}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <CheckCircle2 size={15} /> Confirmar pago recibido
                                </button>
                                <button
                                    type="button"
                                    onClick={() => rechazar(p)}
                                    disabled={procesando === p.id_pedido}
                                    className="inline-flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                                >
                                    <XCircle size={15} /> No pude confirmar el pago
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default PagosPorVerificar;
