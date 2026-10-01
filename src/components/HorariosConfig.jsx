import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Copy, Power, Loader2, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosConfig';

// Orden de visualización Lunes -> Domingo (dia_semana: 0 = Domingo)
const DIAS = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 0, nombre: 'Domingo' }
];
const MAX_TURNOS = 4;
const TURNO_DEFAULT = { apertura: '19:00', cierre: '23:30' };
const MOTIVOS_RAPIDOS = ['Cerrado por feriado', 'Cerrado por duelo', 'Cerrado por vacaciones', 'Cerrado por un imprevisto'];

// { [dia]: [{ apertura, cierre }] } a partir de la lista plana de turnos
const agruparTurnos = (turnos) => {
    const grilla = {};
    DIAS.forEach(d => { grilla[d.id] = []; });
    turnos.forEach(t => grilla[t.dia_semana].push({ apertura: t.apertura, cierre: t.cierre }));
    return grilla;
};

const grillaInicial = () => {
    const grilla = {};
    DIAS.forEach(d => { grilla[d.id] = [{ ...TURNO_DEFAULT }]; });
    return grilla;
};

const formatFecha = (iso) => new Date(iso).toLocaleString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit'
});

/**
 * Configuración de horarios por día (con varios turnos) y cierre manual del local.
 * Guarda de forma independiente al resto de la configuración.
 */
const HorariosConfig = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [grilla, setGrilla] = useState(grillaInicial);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ type: '', text: '' });

    const [formCierre, setFormCierre] = useState(false);
    const [motivo, setMotivo] = useState(MOTIVOS_RAPIDOS[0]);
    const [hasta, setHasta] = useState('');
    const [cambiandoCierre, setCambiandoCierre] = useState(false);

    const cargar = async () => {
        try {
            const response = await api.get('/admin/horarios');
            setData(response.data);
            if (response.data.horarios_configurados) {
                setGrilla(agruparTurnos(response.data.turnos));
            }
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            setMensaje({ type: 'error', text: 'No se pudieron cargar los horarios.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const actualizarDia = (dia, turnos) => setGrilla(prev => ({ ...prev, [dia]: turnos }));

    const setTurno = (dia, idx, campo, valor) => {
        actualizarDia(dia, grilla[dia].map((t, i) => (i === idx ? { ...t, [campo]: valor } : t)));
    };

    const copiarATodos = (dia) => {
        const turnos = grilla[dia];
        const nueva = {};
        DIAS.forEach(d => { nueva[d.id] = turnos.map(t => ({ ...t })); });
        setGrilla(nueva);
    };

    const guardarHorarios = async () => {
        const turnos = DIAS.flatMap(d => grilla[d.id].map(t => ({ dia_semana: d.id, apertura: t.apertura, cierre: t.cierre })));
        try {
            setGuardando(true);
            setMensaje({ type: '', text: '' });
            await api.put('/admin/horarios', { turnos });
            await cargar();
            setMensaje({ type: 'success', text: 'Horarios guardados.' });
        } catch (error) {
            setMensaje({ type: 'error', text: error.response?.data?.message || 'No se pudieron guardar los horarios.' });
        } finally {
            setGuardando(false);
        }
    };

    const cambiarCierre = async (cerrado) => {
        try {
            setCambiandoCierre(true);
            setMensaje({ type: '', text: '' });
            await api.put('/admin/cierre', {
                cerrado,
                motivo: cerrado ? motivo : null,
                hasta: cerrado && hasta ? new Date(hasta).toISOString() : null
            });
            setFormCierre(false);
            setHasta('');
            await cargar();
        } catch (error) {
            setMensaje({ type: 'error', text: error.response?.data?.message || 'No se pudo cambiar el estado del local.' });
        } finally {
            setCambiandoCierre(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-center">
                <Loader2 className="animate-spin text-gold-600" size={24} />
            </div>
        );
    }

    const estado = data?.estado;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Clock className="text-gold-600" size={20} /> Horarios y Estado del Local
                    </h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">Fuera de horario o con el local cerrado, tus clientes no pueden comprar.</p>
                </div>
                {estado && (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${estado.abierto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${estado.abierto ? 'bg-green-500' : 'bg-red-500'}`} />
                        {estado.abierto
                            ? (estado.cierra_a ? `Abierto · cierra ${estado.cierra_a}` : 'Abierto')
                            : 'Cerrado'}
                    </span>
                )}
            </div>

            {mensaje.text && (
                <div className={`p-3 rounded-2xl text-sm font-bold flex items-center gap-2 ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mensaje.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {mensaje.text}
                </div>
            )}

            {/* Cierre manual */}
            {data?.cierre_manual ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="font-black text-red-700 flex items-center gap-2"><Power size={16} /> Local cerrado manualmente</p>
                        <p className="text-sm text-red-600 font-bold mt-1">
                            {data.cierre_motivo || 'Sin motivo'}
                            {data.cierre_hasta ? ` · Reabre solo el ${formatFecha(data.cierre_hasta)}` : ' · Hasta que lo vuelvas a abrir'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => cambiarCierre(false)}
                        disabled={cambiandoCierre}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                        {cambiandoCierre ? 'Abriendo...' : 'Reabrir local'}
                    </button>
                </div>
            ) : formCierre ? (
                <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 space-y-4">
                    <p className="font-black text-gray-800">Cerrar el local ahora</p>
                    <div className="flex flex-wrap gap-2">
                        {MOTIVOS_RAPIDOS.map(m => (
                            <button
                                type="button"
                                key={m}
                                onClick={() => setMotivo(m)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${motivo === m ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                            >
                                {m.replace('Cerrado por ', '')}
                            </button>
                        ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mensaje para tus clientes</label>
                            <input
                                type="text"
                                maxLength={150}
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="w-full bg-white border-2 border-gray-100 p-3 rounded-2xl focus:border-red-500 outline-none font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Reabrir automáticamente (opcional)</label>
                            <input
                                type="datetime-local"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                                className="w-full bg-white border-2 border-gray-100 p-3 rounded-2xl focus:border-red-500 outline-none font-bold text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={() => setFormCierre(false)} className="px-5 py-2.5 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-100 cursor-pointer">
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => cambiarCierre(true)}
                            disabled={cambiandoCierre}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {cambiandoCierre ? 'Cerrando...' : 'Cerrar local'}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setFormCierre(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 px-6 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer"
                >
                    <Power size={16} /> Cerrar local ahora (feriado, duelo, imprevisto...)
                </button>
            )}

            {!data?.horarios_configurados && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold p-3 rounded-2xl">
                    Todavía no configuraste tus horarios: tu tienda acepta pedidos a cualquier hora. Ajustá la grilla y guardala para activarlos.
                </div>
            )}

            {/* Grilla semanal */}
            <div className="divide-y divide-gray-100 border-y border-gray-100">
                {DIAS.map(dia => {
                    const turnos = grilla[dia.id];
                    const abierto = turnos.length > 0;
                    return (
                        <div key={dia.id} className="py-4 flex flex-col md:flex-row md:items-start gap-3">
                            <div className="flex items-center justify-between md:w-48 shrink-0">
                                <span className="font-black text-gray-800 text-sm">{dia.nombre}</span>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <span className={`text-[10px] font-black uppercase ${abierto ? 'text-green-600' : 'text-gray-400'}`}>
                                        {abierto ? 'Abierto' : 'Cerrado'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={abierto}
                                        onChange={(e) => actualizarDia(dia.id, e.target.checked ? [{ ...TURNO_DEFAULT }] : [])}
                                        className="w-4 h-4 accent-green-600 cursor-pointer"
                                    />
                                </label>
                            </div>

                            <div className="flex-1 space-y-2">
                                {turnos.map((t, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-2">
                                        <input
                                            type="time"
                                            value={t.apertura}
                                            onChange={(e) => setTurno(dia.id, idx, 'apertura', e.target.value)}
                                            className="bg-gray-50 border-2 border-gray-100 px-3 py-2 rounded-xl font-bold text-sm focus:border-gold-500 outline-none"
                                        />
                                        <span className="text-gray-400 font-bold text-sm">a</span>
                                        <input
                                            type="time"
                                            value={t.cierre}
                                            onChange={(e) => setTurno(dia.id, idx, 'cierre', e.target.value)}
                                            className="bg-gray-50 border-2 border-gray-100 px-3 py-2 rounded-xl font-bold text-sm focus:border-gold-500 outline-none"
                                        />
                                        {t.cierre && t.apertura && t.cierre < t.apertura && (
                                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">cierra al día siguiente</span>
                                        )}
                                        <button
                                            type="button"
                                            title="Quitar turno"
                                            onClick={() => actualizarDia(dia.id, turnos.filter((_, i) => i !== idx))}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}

                                {abierto && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {turnos.length < MAX_TURNOS && (
                                            <button
                                                type="button"
                                                onClick={() => actualizarDia(dia.id, [...turnos, { apertura: '', cierre: '' }])}
                                                className="flex items-center gap-1 text-xs font-bold text-gold-700 hover:bg-gold-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                                            >
                                                <Plus size={13} /> Agregar turno
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => copiarATodos(dia.id)}
                                            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                                        >
                                            <Copy size={13} /> Copiar a todos los días
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={guardarHorarios}
                    disabled={guardando}
                    className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-gold-100 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    {guardando ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {guardando ? 'Guardando...' : 'Guardar Horarios'}
                </button>
            </div>
        </div>
    );
};

export default HorariosConfig;
