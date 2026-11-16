import { useState } from 'react';
import { Bike, Loader2, ExternalLink, RefreshCw, XCircle, Send, LifeBuoy } from 'lucide-react';
import api from '../api/axiosConfig';

const TEXTOS = {
    CONFIRMED: 'Buscando repartidor',
    IN_PROGRESS: 'Repartidor asignado',
    NEAR_PICKUP: 'Repartidor llegando al local',
    PICKED_UP: 'En camino al cliente',
    NEAR_DROPOFF: 'Llegando al cliente',
    COMPLETED: 'Entregado',
    CANCELLED: 'Envío cancelado',
    REJECTED: 'Envío rechazado'
};
const FINALES = ['COMPLETED', 'CANCELLED', 'REJECTED'];
const PAGADOS = ['Aprobado', 'Preparando', 'En preparación', 'En camino'];

const hora = (fecha) => fecha
    ? new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })
    : null;
const pesos = (n) => (n == null ? null : `$${Number(n).toLocaleString('es-AR')}`);

/** Estado y acciones del envío de PedidosYa de un pedido (tarjeta en Pedidos). */
const EnvioPedidosYa = ({ pedido, onCambio }) => {
    const [accion, setAccion] = useState('');
    const [msg, setMsg] = useState('');

    const estado = pedido.pya_estado;
    const tieneEnvio = !!pedido.pya_shipping_id && !FINALES.includes(estado);
    const programado = !pedido.pya_shipping_id && !!pedido.pya_pedir_en;
    const pagado = PAGADOS.includes(pedido.estado);
    const puedePedir = pagado && !tieneEnvio && estado !== 'COMPLETED';
    const puedeCancelar = programado || estado === 'CONFIRMED';

    const ejecutar = async (nombre, url, confirmar) => {
        if (confirmar && !window.confirm(confirmar)) return;
        setAccion(nombre);
        setMsg('');
        try {
            const { data } = await api.post(url, {});
            setMsg(data.message || '');
            onCambio?.();
        } catch (error) {
            const data = error.response?.data || {};
            setMsg(data.message || 'No se pudo completar la acción.');
            if (data.soporte_url) window.open(data.soporte_url, '_blank', 'noopener');
        } finally {
            setAccion('');
        }
    };

    let titulo;
    if (estado) titulo = TEXTOS[estado] || estado;
    else if (programado) titulo = `Se pide a las ${hora(pedido.pya_pedir_en)}`;
    else if (pedido.pya_error) titulo = 'No se pudo pedir el repartidor';
    else titulo = pagado ? 'Repartidor sin pedir' : 'Se pide cuando se confirme el pago';

    const base = `/envios/pedidosya/${pedido.id_pedido}`;
    const boton = 'flex-1 min-w-[8rem] flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50';

    return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                        <Bike size={12} /> PedidosYa {pedido.pya_es_test ? '· prueba' : ''}
                    </p>
                    <p className="font-black text-gray-800 text-sm">{titulo}</p>
                    {pedido.pya_eta_entrega && tieneEnvio && (
                        <p className="text-[11px] font-bold text-gray-500">Entrega estimada {hora(pedido.pya_eta_entrega)}</p>
                    )}
                    {pedido.pya_confirmation_code && (
                        <p className="text-[11px] font-bold text-gray-500">Código: <span className="font-mono">{pedido.pya_confirmation_code}</span></p>
                    )}
                    {pedido.pya_error && !tieneEnvio && (
                        <p className="text-[11px] font-bold text-red-600 mt-1">{pedido.pya_error}</p>
                    )}
                </div>
                <div className="text-right text-[10px] font-black uppercase tracking-tight text-gray-400 shrink-0">
                    {pedido.pya_costo_cobrado != null && <p>Cobrado {pesos(pedido.pya_costo_cobrado)}</p>}
                    {pedido.pya_costo_real != null && <p>PedidosYa {pesos(pedido.pya_costo_real)}</p>}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {puedePedir && (
                    <button type="button" disabled={!!accion} onClick={() => ejecutar('pedir', `${base}/pedir-ahora`)} className={`${boton} bg-rose-600 hover:bg-rose-700 text-white`}>
                        {accion === 'pedir' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {estado === 'CANCELLED' || estado === 'REJECTED' || pedido.pya_error ? 'Pedir de nuevo' : 'Pedir ahora'}
                    </button>
                )}
                {puedeCancelar && (
                    <button type="button" disabled={!!accion} onClick={() => ejecutar('cancelar', `${base}/cancelar`, '¿Cancelar el repartidor de PedidosYa para este pedido?')} className={`${boton} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}>
                        {accion === 'cancelar' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Cancelar
                    </button>
                )}
                {tieneEnvio && (
                    <button type="button" disabled={!!accion} onClick={() => ejecutar('actualizar', `${base}/actualizar`)} className={`${boton} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}>
                        {accion === 'actualizar' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Actualizar
                    </button>
                )}
                {pedido.pya_tracking_url && tieneEnvio && (
                    <a href={pedido.pya_tracking_url} target="_blank" rel="noreferrer" className={`${boton} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}>
                        <ExternalLink size={14} /> Seguimiento
                    </a>
                )}
                {pedido.pya_soporte_url && tieneEnvio && estado !== 'CONFIRMED' && (
                    <a href={pedido.pya_soporte_url} target="_blank" rel="noreferrer" className={`${boton} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}>
                        <LifeBuoy size={14} /> Soporte
                    </a>
                )}
            </div>
            {msg && <p role="status" className="text-[11px] font-bold text-gray-600">{msg}</p>}
        </div>
    );
};

export default EnvioPedidosYa;
