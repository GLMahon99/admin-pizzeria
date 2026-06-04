import { useState, useEffect, useCallback } from 'react';
import { 
    Bike, 
    Key, 
    Phone, 
    MapPin, 
    CheckCircle, 
    LogOut, 
    Compass, 
    Clock, 
    ChevronDown, 
    ChevronUp, 
    Utensils, 
    AlertCircle 
} from 'lucide-react';
import api from '../api/axiosConfig';
import { parseAddress, formatAddress } from '../utils/formatters';

const DriverDashboard = () => {
    const [token, setToken] = useState(localStorage.getItem('repartidor_token') || null);
    const [driver, setDriver] = useState(JSON.parse(localStorage.getItem('repartidor_user')) || null);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Formulario de login
    const [loginForm, setLoginForm] = useState({
        telefono: '',
        pin: ''
    });

    // Cargar entregas del repartidor
    const fetchDeliveries = useCallback(async (silent = false) => {
        if (!token) return;
        if (!silent) setLoading(true);
        try {
            const response = await api.get('/pedidos/repartidor/mis-entregas');
            setDeliveries(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar entregas:', err);
            if (!silent) setError('No pudimos cargar tus repartos activos.');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [token]);

    // Asignar el pedido al cadete
    const handleAutoAssign = useCallback(async (pedidoId) => {
        try {
            setLoading(true);
            const response = await api.post(`/pedidos/${pedidoId}/repartidor/auto-asignar`);
            alert(response.data.message || `Pedido #${pedidoId} asignado correctamente.`);
            
            // Limpiar query params de la URL para evitar re-ejecución al recargar
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            localStorage.removeItem('pending_assign_pedido_id');
            
            fetchDeliveries();
        } catch (err) {
            console.error('Error al autoasignar pedido:', err);
            alert(err.response?.data?.message || `No se pudo asignar el pedido #${pedidoId}.`);
            // Limpiar params para no quedar en bucle
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            localStorage.removeItem('pending_assign_pedido_id');
        } finally {
            setLoading(false);
        }
    }, [fetchDeliveries]);

    // Procesar parámetros de URL (pedidos escaneados por QR y Tenant slug)
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tenant = queryParams.get('tenant');
        const pedido = queryParams.get('pedido');

        if (tenant) {
            localStorage.setItem('repartidor_tenant_slug', tenant);
        }

        // Si hay una orden escaneada y ya estamos logueados, auto-asignarla
        if (pedido && token) {
            handleAutoAssign(pedido);
        } else if (pedido) {
            // Guardar id de pedido pendiente para auto-asignar tras el login
            localStorage.setItem('pending_assign_pedido_id', pedido);
        }
    }, [token, handleAutoAssign]);

    // Establecer el título de la página
    useEffect(() => {
        document.title = "Portal de Reparto - Pizzería";
    }, []);

    useEffect(() => {
        if (token) {
            fetchDeliveries();

            // Polling silencioso cada 15 segundos para repartidores
            const interval = setInterval(() => {
                fetchDeliveries(true);
            }, 15000);

            return () => clearInterval(interval);
        }
    }, [token, fetchDeliveries]);

    // Actualizar el estado del pedido
    const handleUpdateStatus = async (pedidoId, currentStatus) => {
        let nuevo_estado = '';
        if (currentStatus.toLowerCase() === 'aprobado' || currentStatus.toLowerCase() === 'preparando' || currentStatus.toLowerCase() === 'pendiente') {
            nuevo_estado = 'En camino';
        } else if (currentStatus.toLowerCase() === 'en camino') {
            nuevo_estado = 'Entregado';
        } else {
            return; // Ya está entregado o en otro estado
        }

        const confirmMsg = `¿Deseas marcar el pedido #${pedidoId} como "${nuevo_estado}"?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            setLoading(true);
            await api.put('/pedidos/repartidor/actualizar-estado', {
                id_pedido: pedidoId,
                nuevo_estado
            });
            fetchDeliveries();
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            alert('No se pudo actualizar el estado de entrega.');
        } finally {
            setLoading(false);
        }
    };

    // Iniciar Sesión de Repartidor
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (loginLoading) return;

        const tenant = localStorage.getItem('repartidor_tenant_slug');
        if (!tenant) {
            alert('Falta el identificador de la pizzería. Escanea un código QR primero o asegúrate de que el enlace sea el correcto.');
            return;
        }

        setLoginLoading(true);
        try {
            const response = await api.post('/repartidores/login', loginForm);
            const { token: userToken, user: userData } = response.data;

            localStorage.setItem('repartidor_token', userToken);
            localStorage.setItem('repartidor_user', JSON.stringify(userData));

            setToken(userToken);
            setDriver(userData);

            // Si había un pedido pendiente de asignación
            const pendingPedido = localStorage.getItem('pending_assign_pedido_id');
            if (pendingPedido) {
                // El useEffect se encargará de ejecutarlo tras el cambio de estado de token
            }
        } catch (err) {
            console.error('Error en login de repartidor:', err);
            alert(err.response?.data?.message || 'Error al iniciar sesión.');
        } finally {
            setLoginLoading(false);
        }
    };

    // Cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('repartidor_token');
        localStorage.removeItem('repartidor_user');
        setToken(null);
        setDriver(null);
        setDeliveries([]);
    };

    // Renderizado del Login
    if (!token) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
                    
                    {/* Header del Login */}
                    <div className="text-center space-y-3">
                        <div className="bg-gold-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-gold-500 border border-gold-500/20">
                            <Bike size={40} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Portal de <span className="text-gold-500">Reparto</span></h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ingresa tus credenciales de cadete</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Phone size={14} className="text-gold-500" /> Teléfono
                            </label>
                            <input 
                                type="tel" 
                                required
                                placeholder="Ej. 1122334455"
                                className="w-full p-4 bg-slate-950/60 border border-slate-800 focus:border-gold-500 rounded-2xl outline-none font-bold text-white transition-colors"
                                value={loginForm.telefono}
                                onChange={(e) => setLoginForm({ ...loginForm, telefono: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Key size={14} className="text-gold-500" /> PIN de Acceso
                            </label>
                            <input 
                                type="password" 
                                required
                                maxLength={10}
                                placeholder="••••"
                                className="w-full p-4 bg-slate-950/60 border border-slate-800 focus:border-gold-500 rounded-2xl outline-none font-black tracking-widest text-center text-white text-xl transition-colors"
                                value={loginForm.pin}
                                onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full bg-gold-600 hover:bg-gold-500 disabled:bg-slate-800 text-slate-950 font-black p-4 rounded-2xl text-base uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold-500/10"
                        >
                            {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                            Para iniciar sesión, primero debes estar registrado en la pizzería y escanear un ticket.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Renderizado del Dashboard Principal del Repartidor
    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header Fijo */}
            <header className="fixed top-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 z-40">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center h-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-gold-500 text-slate-950 p-2.5 rounded-xl shadow-lg shadow-gold-500/10">
                            <Bike size={20} />
                        </div>
                        <div>
                            <h2 className="font-black text-sm uppercase tracking-tight leading-none text-gold-500">{driver?.nombre}</h2>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Repartidor Activo</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="p-3 bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-slate-700/50"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="max-w-3xl mx-auto px-4 pt-28 space-y-6">
                
                {/* Título de sección */}
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-black uppercase tracking-wider text-slate-300">Mis <span className="text-gold-500">Repartos</span></h1>
                    <button 
                        onClick={fetchDeliveries}
                        className="text-xs font-black uppercase tracking-widest text-gold-500 bg-gold-500/10 px-4 py-2 border border-gold-500/20 rounded-xl hover:bg-gold-500/20 transition-all"
                    >
                        Actualizar
                    </button>
                </div>

                {error && (
                    <div className="bg-red-950/40 border border-red-900 p-6 rounded-3xl flex items-start gap-4 text-red-200">
                        <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest">Error de Conexión</p>
                            <p className="text-xs font-bold text-red-400 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Listado */}
                {loading ? (
                    <div className="py-20 text-center text-slate-500">
                        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-black text-[10px] uppercase tracking-widest">Cargando tus entregas...</p>
                    </div>
                ) : deliveries.length > 0 ? (
                    <div className="space-y-6">
                        {deliveries.map((pedido) => {
                            const isExpanded = expandedOrder === pedido.id_pedido;
                            const isEnCamino = pedido.estado.toLowerCase() === 'en camino';
                            
                            return (
                                <div 
                                    key={pedido.id_pedido} 
                                    className={`bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden transition-all shadow-xl ${
                                        isEnCamino ? 'ring-2 ring-gold-500/30 border-gold-500/20' : ''
                                    }`}
                                >
                                    {/* Cabecera del pedido */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Orden a entregar</span>
                                                <h3 className="text-lg font-black text-white">Pedido #{pedido.id_pedido}</h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                isEnCamino 
                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {pedido.estado}
                                            </span>
                                        </div>

                                        {/* Información del cliente */}
                                        <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cliente</p>
                                                <p className="font-black text-white text-base leading-none uppercase">{pedido.cliente_nombre || 'Cliente Mostrador'}</p>
                                            </div>

                                            {pedido.cliente_direccion && (() => {
                                                const addr = parseAddress(pedido.cliente_direccion);
                                                return (
                                                    <div className="space-y-3 pt-2 border-t border-slate-900 w-full">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dirección de Entrega</p>
                                                            <p className="font-bold text-slate-200 text-sm">{formatAddress(addr)}</p>
                                                        </div>
                                                        {addr.observaciones && (
                                                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400">
                                                                <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">Notas de Entrega (Observación)</p>
                                                                <p className="text-xs font-bold leading-normal">{addr.observaciones}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Enlaces de Utilidad (Llamada y Mapas) */}
                                        <div className="flex gap-3">
                                            {pedido.cliente_direccion && (() => {
                                                const addr = parseAddress(pedido.cliente_direccion);
                                                const mapsQuery = `${addr.calle} ${addr.altura}`;
                                                return (
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-700/60"
                                                    >
                                                        <Compass size={14} className="text-gold-500" /> Abrir GPS
                                                    </a>
                                                );
                                            })()}
                                            
                                            {pedido.cliente_telefono && (
                                                <a 
                                                    href={`tel:${pedido.cliente_telefono}`}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-700/60"
                                                >
                                                    <Phone size={14} className="text-gold-500" /> Llamar Cliente
                                                </a>
                                            )}
                                        </div>

                                        {/* Acciones de Estado */}
                                        <div className="pt-2">
                                            {isEnCamino ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(pedido.id_pedido, pedido.estado)}
                                                    className="w-full bg-green-600 hover:bg-green-500 text-slate-950 font-black p-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-[0.98]"
                                                >
                                                    <CheckCircle size={16} /> Completar Entrega ✅
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateStatus(pedido.id_pedido, pedido.estado)}
                                                    className="w-full bg-gold-600 hover:bg-gold-500 text-slate-950 font-black p-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-900/20 active:scale-[0.98]"
                                                >
                                                    <Bike size={16} /> Iniciar Reparto 🛵
                                                </button>
                                            )}
                                        </div>

                                        {/* Toggle Detalles de Productos */}
                                        <div className="text-center pt-2">
                                            <button 
                                                onClick={() => setExpandedOrder(isExpanded ? null : pedido.id_pedido)}
                                                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <>Ocultar Productos <ChevronUp size={12} /></>
                                                ) : (
                                                    <>Ver Productos <ChevronDown size={12} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Productos detallados */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 bg-slate-950/40 border-t border-slate-800/50">
                                            <div className="pt-4 space-y-2">
                                                {pedido.detalle && pedido.detalle.map((item, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800/60"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-gold-500/10 text-gold-500 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">
                                                                {item.cantidad}x
                                                            </span>
                                                            <span className="text-xs font-bold text-slate-200">
                                                                {item.producto_nombre}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Estado vacío para el repartidor
                    <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-6">
                        <div className="bg-slate-950 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-850">
                            <Bike size={36} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-lg uppercase tracking-tight">Sin entregas activas</h3>
                            <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
                                Escanea el código QR de un ticket impreso para auto-asignarte un pedido y comenzar el reparto.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DriverDashboard;
