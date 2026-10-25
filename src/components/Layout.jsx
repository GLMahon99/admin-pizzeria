import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar fijo */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Área de contenido con margen para no solaparse */}
            {/* min-w-0: sin esto, contenido ancho (ej. las pestañas con scroll de Configuración) estira el main y se corta a la derecha */}
            <main className={`flex-1 min-w-0 transition-all duration-300 p-10 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;