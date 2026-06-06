import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    LogOut,
    Store,
    User,
    PackageCheck,
    Bike,
    Settings as SettingsIcon,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

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

    return (
        <aside className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 transition-all duration-300 ${
            isCollapsed ? 'w-20' : 'w-64'
        }`}>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-8 -right-3 bg-gold-600 hover:bg-gold-700 text-white p-1 rounded-full border border-slate-800 transition-all z-50 shadow-md hover:scale-110 active:scale-95"
                title={isCollapsed ? "Expandir Menú" : "Contraer Menú"}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Logo Area */}
            <div className={`p-8 flex items-center gap-3 ${isCollapsed ? 'justify-center px-4' : ''}`}>
                {user?.logo_url ? (
                    <img src={user.logo_url} alt={user.nombre} className="h-14 w-auto object-contain rounded-lg flex-shrink-0" />
                ) : (
                    <div className="bg-gold-600 p-2 rounded-xl shadow-lg shadow-gold-900/20 flex-shrink-0">
                        <Store className="text-white" size={24} />
                    </div>
                )}
                {!isCollapsed && (
                    <span className="text-xl font-black text-white tracking-tighter italic truncate animate-in fade-in duration-300">
                        {user?.nombre?.split(' ')[0]}<span className="text-gold-500">ADMIN</span>
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        title={isCollapsed ? item.label : undefined}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
                            ${isCollapsed ? 'justify-center px-2' : ''}
                            ${isActive
                                ? 'bg-gold-600 text-white shadow-lg shadow-gold-600/20'
                                : 'hover:bg-slate-800 hover:text-white'}
                        `}
                    >
                        {item.icon}
                        {!isCollapsed && (
                            <span className="animate-in fade-in duration-200">{item.label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User & Footer */}
            <div className="p-4 border-t border-slate-700/50 space-y-2">
                
                <NavLink
                    to="/soporte"
                    title={isCollapsed ? "Soporte" : undefined}
                    className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
                        ${isCollapsed ? 'justify-center px-2' : ''}
                        ${isActive
                            ? 'bg-gold-600 text-white shadow-lg shadow-gold-600/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    `}
                >
                    <HelpCircle size={20} />
                    {!isCollapsed && <span className="animate-in fade-in duration-200">Soporte</span>}
                </NavLink>

                <NavLink
                    to="/configuracion"
                    title={isCollapsed ? "Configuración" : undefined}
                    className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
                        ${isCollapsed ? 'justify-center px-2' : ''}
                        ${isActive
                            ? 'bg-gold-600 text-white shadow-lg shadow-gold-600/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    `}
                >
                    <SettingsIcon size={20} />
                    {!isCollapsed && <span className="animate-in fade-in duration-200">Configuración</span>}
                </NavLink>

                {/* Botón de Pantalla Completa */}
                <button
                    onClick={toggleFullscreen}
                    title={isCollapsed ? (isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa") : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 ${
                        isCollapsed ? 'justify-center px-2' : ''
                    }`}
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    {!isCollapsed && <span className="animate-in fade-in duration-200">{isFullscreen ? "Pantalla Normal" : "Pantalla Completa"}</span>}
                </button>

                <div className={`flex items-center gap-3 px-4 py-2 pt-2 ${isCollapsed ? 'justify-center px-2' : ''}`}>
                    <div className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center text-gold-500 border border-slate-700 flex-shrink-0">
                        <User size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden animate-in fade-in duration-200">
                            <p className="text-sm font-bold text-white truncate">{user?.nombre || 'Admin Gaston'}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Nivel Gerencia</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Cerrar Sesión" : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 ${
                        isCollapsed ? 'justify-center px-2' : ''
                    }`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="animate-in fade-in duration-200">Cerrar Sesión</span>}
                </button>
            </div>

            {!isCollapsed && (
                <div className="p-6 text-center px-4 animate-in fade-in duration-200">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest break-words leading-relaxed">
                        {user?.direccion ? `${user.direccion}${user.ciudad ? `, ${user.ciudad}` : ''}` : 'Florida, BA • 2026'}
                    </p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;