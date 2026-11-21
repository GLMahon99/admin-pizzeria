import { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import api from '../api/axiosConfig';
import { confirmar } from '../utils/feedback';

const inputClass = 'w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-purple-600 outline-none text-sm';
const labelClass = 'text-xs font-black text-gray-400 uppercase tracking-widest ml-1';

const esVerdadero = (v) => [true, 1, '1', 'true'].includes(v);

/**
 * Configuración de envíos con PedidosYa (sección "Envío y logística").
 * El token se guarda cifrado en el servidor y nunca vuelve: solo sabemos si hay uno conectado.
 */
const ConfigPedidosYa = ({ config, setConfig }) => {
    const [prueba, setPrueba] = useState({ estado: '', texto: '' }); // estado: '', 'probando', 'ok', 'error'
    const conectado = esVerdadero(config.pya_conectado) && !config.pya_token_borrar;
    const envioGratis = esVerdadero(config.pya_envio_gratis);
    const modoTest = esVerdadero(config.pya_modo_test ?? 1);
    const set = (campo, valor) => setConfig({ ...config, [campo]: valor });

    const probar = async () => {
        setPrueba({ estado: 'probando', texto: '' });
        try {
            const { data } = await api.post('/envios/pedidosya/probar', { token: config.pya_token || undefined });
            setPrueba({ estado: 'ok', texto: data.message });
        } catch (error) {
            setPrueba({ estado: 'error', texto: error.response?.data?.message || 'No se pudo probar la conexión.' });
        }
    };

    return (
        <div className="space-y-5">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-2">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={12} /> Tu propia cuenta de PedidosYa Envíos
                </p>
                <p className="text-xs text-purple-700 leading-relaxed font-medium">
                    PedidosYa te factura cada envío a vos. Creá tu cuenta gratis, entrá a <b>Integraciones → Generar token</b> y pegalo acá.
                    El repartidor retira en la dirección y ciudad de tu local (sección Redes y contacto).
                </p>
                <a
                    href="https://envios.pedidosya.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-black text-purple-700 underline underline-offset-4"
                >
                    Ir a PedidosYa Envíos <ExternalLink size={12} />
                </a>
            </div>

            <div className="space-y-2">
                <label className={labelClass}>Token de PedidosYa</label>
                <input
                    type="password"
                    autoComplete="off"
                    className={`${inputClass} font-mono`}
                    value={config.pya_token || ''}
                    onChange={(e) => setConfig({ ...config, pya_token: e.target.value, pya_token_borrar: false })}
                    placeholder={conectado ? '•••••••• (token guardado: pegá uno nuevo solo para cambiarlo)' : 'Pegá el token generado en Integraciones'}
                />
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={probar}
                        disabled={prueba.estado === 'probando' || (!config.pya_token && !conectado)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        {prueba.estado === 'probando' && <Loader2 size={14} className="animate-spin" />} Probar conexión
                    </button>
                    {conectado && (
                        <button
                            type="button"
                            onClick={async () => (await confirmar('¿Desconectar la cuenta de PedidosYa? No vas a poder recibir pedidos con envío hasta conectarla de nuevo o pasar a repartidores propios.', { peligro: true, textoConfirmar: 'Desconectar' })) && setConfig({ ...config, pya_token: '', pya_token_borrar: true })}
                            className="text-xs font-black text-red-600 uppercase tracking-widest"
                        >
                            Desconectar
                        </button>
                    )}
                    <span className={`text-[10px] font-black uppercase ${conectado ? 'text-green-600' : 'text-gray-400'}`}>
                        {config.pya_token_borrar ? 'Se desconecta al guardar' : conectado ? 'Cuenta conectada' : 'Sin conectar'}
                    </span>
                </div>
                {prueba.texto && (
                    <p role="status" className={`flex items-center gap-1.5 text-xs font-bold ${prueba.estado === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
                        {prueba.estado === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {prueba.texto}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <p className={labelClass}>¿Quién paga el envío?</p>
                <div role="radiogroup" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { gratis: false, titulo: 'El comprador', texto: 'Se le cobra el precio que cotiza PedidosYa para su dirección.' },
                        { gratis: true, titulo: 'Envío gratis', texto: 'El comprador no paga envío: el costo lo cubrís vos.' }
                    ].map(({ gratis, titulo, texto }) => {
                        const activo = envioGratis === gratis;
                        return (
                            <button
                                key={titulo}
                                type="button"
                                role="radio"
                                aria-checked={activo}
                                onClick={() => set('pya_envio_gratis', gratis ? 1 : 0)}
                                className={`text-left p-4 rounded-2xl border-2 transition-all ${activo ? 'border-purple-300 bg-purple-50/60' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                            >
                                <span className="block font-black text-gray-800 text-sm">{titulo}</span>
                                <span className="block text-[11px] text-gray-500 font-bold">{texto}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className={labelClass}>Demora para pedir el repartidor (min)</label>
                    <input
                        type="number"
                        min="0"
                        max="60"
                        className={`${inputClass} font-mono`}
                        value={config.pya_demora_min ?? 10}
                        onChange={(e) => set('pya_demora_min', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Se cuenta desde que se confirma el pago. Así el repartidor no llega antes de que esté listo.</p>
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Teléfono para el repartidor</label>
                    <input
                        type="tel"
                        className={`${inputClass} font-mono`}
                        value={config.pya_retiro_telefono || ''}
                        onChange={(e) => set('pya_retiro_telefono', e.target.value)}
                        placeholder={config.whatsapp ? `Si lo dejás vacío: ${config.whatsapp}` : 'Ej: 11 4444 5555'}
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Opcional si cargaste el WhatsApp del local.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className={labelClass}>Indicaciones para retirar (opcional)</label>
                    <input
                        type="text"
                        maxLength={200}
                        className={inputClass}
                        value={config.pya_retiro_instrucciones || ''}
                        onChange={(e) => set('pya_retiro_instrucciones', e.target.value)}
                        placeholder="Ej: Entrar por la puerta lateral, preguntar en caja"
                    />
                </div>
            </div>

            <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer select-none transition-all ${modoTest ? 'border-amber-300 bg-amber-50/60' : 'border-gray-100 bg-gray-50'}`}>
                <input
                    type="checkbox"
                    className="mt-0.5 w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300 cursor-pointer"
                    checked={modoTest}
                    onChange={(e) => set('pya_modo_test', e.target.checked ? 1 : 0)}
                />
                <span className="flex flex-col">
                    <span className="font-black text-gray-800 text-sm">Modo prueba</span>
                    <span className="text-[11px] text-gray-500 font-bold">Los envíos se crean de prueba: no sale ningún repartidor ni se cobra. Desactivalo para empezar a operar.</span>
                </span>
            </label>
        </div>
    );
};

export default ConfigPedidosYa;
