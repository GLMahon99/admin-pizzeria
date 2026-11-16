import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Store } from 'lucide-react';
import Sidebar from './Sidebar';
import useIsMobile from '../hooks/useIsMobile';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    // En tablet (menos de 1024px) el menú arranca contraído a íconos para dejar más lugar al contenido
    const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1024);
    const isMobile = useIsMobile();
    const location = useLocation();
    const { user } = useAuth();

    // Guardamos en qué ruta se abrió el menú del celular: al navegar (o al agrandar la pantalla) queda cerrado solo
    const [menuAbiertoEn, setMenuAbiertoEn] = useState(null);
    const mobileOpen = isMobile && menuAbiertoEn === location.pathname;
    const setMobileOpen = (abierto) => setMenuAbiertoEn(abierto ? location.pathname : null);

    // Bloquea el scroll del fondo mientras el menú del celular está abierto
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isCollapsed={isMobile ? false : isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobile={isMobile}
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            {/* Fondo oscuro detrás del menú en celular */}
            {isMobile && mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* min-w-0: sin esto, contenido ancho (ej. las pestañas con scroll de Configuración) estira el main y se corta a la derecha */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ${isMobile ? '' : isCollapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Barra superior solo en celular */}
                {isMobile && (
                    <header className="sticky top-0 z-30 h-14 bg-slate-900 text-white flex items-center gap-3 px-4 shadow-md">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="-ml-2 p-2 rounded-xl hover:bg-slate-800 active:bg-slate-800 transition-colors"
                            aria-label="Abrir menú"
                        >
                            <Menu size={24} />
                        </button>
                        {user?.logo_url ? (
                            <img src={user.logo_url} alt={user.nombre} className="h-8 w-auto object-contain rounded-md" />
                        ) : (
                            <div className="bg-gold-600 p-1.5 rounded-lg">
                                <Store size={18} className="text-white" />
                            </div>
                        )}
                        <span className="text-lg font-black tracking-tighter italic truncate">
                            {user?.nombre?.split(' ')[0]}<span className="text-gold-500">ADMIN</span>
                        </span>
                    </header>
                )}

                <div className="p-4 md:p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
