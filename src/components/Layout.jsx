import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar provisorio */}
            <aside className="w-64 bg-slate-800 text-white p-6 flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-orange-400 mb-4">Admin Pizza</h2>
                <Link to="/" className="hover:text-orange-300">Dashboard</Link>
                <Link to="/pedidos" className="hover:text-orange-300">Pedidos</Link>
                <Link to="/inventario" className="hover:text-orange-300">Inventario</Link>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 p-10 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
}