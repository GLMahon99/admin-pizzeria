import { Link } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';

// Envuelve secciones que no están disponibles desde el celular.
// En tablet y escritorio renderiza el contenido normal.
const SoloEscritorio = ({ children, seccion = 'Esta sección' }) => {
    const isMobile = useIsMobile();
    if (!isMobile) return children;

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/40 p-8 text-center max-w-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mb-5">
                    <Monitor size={28} />
                </div>
                <h1 className="text-xl font-black text-gray-800">{seccion} está disponible desde la compu o tablet</h1>
                <p className="text-sm text-gray-500 font-medium mt-2">
                    Desde el celular podés ver métricas, gestionar pedidos y repartidores, y consultar inventario e insumos.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center mt-6 w-full bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-2xl font-black transition-colors"
                >
                    Ir al panel
                </Link>
            </div>
        </div>
    );
};

export default SoloEscritorio;
