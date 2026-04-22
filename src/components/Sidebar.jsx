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
    Settings as SettingsIcon
} from 'lucide-react';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/pedidos", icon: <ShoppingBag size={20} />, label: "Pedidos" },
        { to: "/inventario", icon: <Package size={20} />, label: "Inventario" },
        { to: "/insumos", icon: <PackageCheck size={20} />, label: "Insumos" },
    ];

    return (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50">

            {/* Logo Area */}
            <div className="p-8 flex items-center gap-3">
                {user?.logo_url ? (
                    <img src={user.logo_url} alt={user.nombre} className="h-10 w-auto object-contain rounded-lg" />
                ) : (
                    <div className="bg-gold-600 p-2 rounded-xl shadow-lg shadow-gold-900/20">
                        <Store className="text-white" size={24} />
                    </div>
                )}
                <span className="text-xl font-black text-white tracking-tighter italic truncate">
                    {user?.nombre?.split(' ')[0]}<span className="text-gold-500">ADMIN</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
              ${isActive
                                ? 'bg-gold-600 text-white shadow-lg shadow-gold-600/20'
                                : 'hover:bg-slate-800 hover:text-white'}
            `}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User & Footer */}
            <div className="p-4 border-t border-slate-700/50 space-y-2">
                
                <NavLink
                    to="/configuracion"
                    className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
                        ${isActive
                            ? 'bg-gold-600 text-white shadow-lg shadow-gold-600/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    `}
                >
                    <SettingsIcon size={20} />
                    Configuración
                </NavLink>

                <div className="flex items-center gap-3 px-4 py-2 pt-2">
                    <div className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center text-gold-500 border border-slate-700">
                        <User size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.nombre || 'Admin Gaston'}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Nivel Gerencia</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                >
                    <LogOut size={20} />
                    Cerrar Sesión
                </button>
            </div>

            <div className="p-6 text-center">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Florida, BA • 2026
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;