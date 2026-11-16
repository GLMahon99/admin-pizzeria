import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    LogOut,
    User,
    PackageCheck,
    Bike,
    Settings as SettingsIcon,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    ShieldCheck,
    X
} from 'lucide-react';

// El menú desplegado tiene exactamente la misma estructura y alturas que el contraído:
// lo único que cambia es el ancho y que al lado de cada ícono aparece el texto.
const Sidebar = ({ isCollapsed, setIsCollapsed, isMobile = false, mobileOpen = false, onClose }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const [logoRoto, setLogoRoto] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error al intentar activar pantalla completa: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/pedidos", icon: <ShoppingBag size={20} />, label: "Pedidos" },
        { to: "/inventario", icon: <Package size={20} />, label: "Inventario" },
        { to: "/insumos", icon: <PackageCheck size={20} />, label: "Insumos" },
        { to: "/repartidores", icon: <Bike size={20} />, label: "Repartidores" },
    ];

    // Misma caja para todos los ítems: alto fijo, ícono siempre en el mismo lugar
    const itemBase = `w-full flex items-center gap-3 h-11 rounded-xl font-bold whitespace-nowrap transition-colors duration-200 ${
        isCollapsed ? 'justify-center px-0' : 'px-3'
    }`;
    const linkClass = (activo, inactivo = 'text-slate-300 hover:bg-slate-800 hover:text-white') => ({ isActive }) =>
        `${itemBase} ${isActive ? activo : inactivo}`;
    const activoNaranja = 'bg-gold-600 text-white shadow-lg shadow-gold-600/20';
    const etiqueta = (texto) => !isCollapsed && <span className="truncate">{texto}</span>;

    return (
        <aside className={`fixed top-0 left-0 h-dvh bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 transition-all duration-300 ${
            isMobile
                ? `w-72 max-w-[85vw] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
                : isCollapsed ? 'w-20' : 'w-64'
        }`}>

            {/* Toggle Button (en celular se cierra con la X o tocando afuera) */}
            {isMobile ? (
                <button
                    onClick={onClose}
                    className="absolute top-5 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Cerrar menú"
                >
                    <X size={22} />
                </button>
            ) : (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute top-7 -right-3 bg-gold-600 hover:bg-gold-700 text-white p-1 rounded-full border border-slate-800 transition-all z-50 shadow-md hover:scale-110 active:scale-95"
                    title={isCollapsed ? "Expandir Menú" : "Contraer Menú"}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            )}

            {/* Logo de Acommerr (sobre fondo blanco: el logo es azul y se perdería sobre el azul del menú) */}
            <div className={`h-20 shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} ${isMobile ? 'pr-14' : ''}`}>
                {isCollapsed ? (
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <img src="/favicon.png" alt="Acommerr" className="h-7 w-auto object-contain" />
                    </div>
                ) : (
                    // El PNG tiene mucho margen vacío arriba y abajo: lo agrandamos y el chip recorta ese aire
                    <div className="h-11 bg-white rounded-xl flex items-center justify-center px-1 shadow-md overflow-hidden">
                        <img src="/logo-acommerr.png" alt="Acommerr" className="h-16 w-auto max-w-none object-contain" />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-1 ${isCollapsed ? 'px-4' : 'px-3'}`}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        title={isCollapsed ? item.label : undefined}
                        className={linkClass(activoNaranja)}
                    >
                        <span className="shrink-0">{item.icon}</span>
                        {etiqueta(item.label)}
                    </NavLink>
                ))}
            </nav>

            {/* User & Footer */}
            <div className={`shrink-0 py-3 border-t border-slate-700/50 space-y-1 overflow-hidden ${isCollapsed ? 'px-4' : 'px-3'}`}>

                {/* Soporte y Configuración solo en tablet/escritorio */}
                {!isMobile && (
                    <>
                        <NavLink to="/soporte" title={isCollapsed ? "Soporte" : undefined} className={linkClass(activoNaranja, 'text-slate-400 hover:bg-slate-800 hover:text-white')}>
                            <HelpCircle size={20} className="shrink-0" />
                            {etiqueta('Soporte')}
                        </NavLink>

                        <NavLink to="/configuracion" title={isCollapsed ? "Configuración" : undefined} className={linkClass(activoNaranja, 'text-slate-400 hover:bg-slate-800 hover:text-white')}>
                            <SettingsIcon size={20} className="shrink-0" />
                            {etiqueta('Configuración')}
                        </NavLink>
                    </>
                )}

                {!isMobile && localStorage.getItem('superadmin_token') && (
                    <NavLink
                        to="/superadmin"
                        title={isCollapsed ? "Panel Master" : undefined}
                        className={linkClass('bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20', 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300')}
                    >
                        <ShieldCheck size={20} className="shrink-0" />
                        {etiqueta('Panel Master')}
                    </NavLink>
                )}

                {/* Botón de Pantalla Completa (no aplica en celular) */}
                {!isMobile && (
                    <button
                        onClick={toggleFullscreen}
                        title={isCollapsed ? (isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa") : undefined}
                        className={`${itemBase} text-slate-400 hover:bg-slate-800 hover:text-white`}
                    >
                        {isFullscreen ? <Minimize2 size={20} className="shrink-0" /> : <Maximize2 size={20} className="shrink-0" />}
                        {etiqueta(isFullscreen ? "Pantalla Normal" : "Pantalla Completa")}
                    </button>
                )}

                {/* Local: logo del comercio (o ícono si no cargó uno) */}
                <div className={`flex items-center gap-3 h-14 whitespace-nowrap ${isCollapsed ? 'justify-center' : 'px-1'}`} title={isCollapsed ? user?.nombre : undefined}>
                    {user?.logo_url && !logoRoto ? (
                        <img
                            src={user.logo_url}
                            alt={user?.nombre || 'Logo del local'}
                            onError={() => setLogoRoto(true)}
                            className="w-10 h-10 rounded-full object-contain bg-white p-0.5 border border-slate-700 shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center text-gold-500 border border-slate-700 shrink-0">
                            <User size={20} />
                        </div>
                    )}
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.nombre || 'Mi local'}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Nivel Gerencia</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Cerrar Sesión" : undefined}
                    className={`${itemBase} text-slate-400 hover:bg-red-500/10 hover:text-red-500`}
                >
                    <LogOut size={20} className="shrink-0" />
                    {etiqueta('Cerrar Sesión')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
