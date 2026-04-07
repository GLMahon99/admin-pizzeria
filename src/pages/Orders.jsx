import { useState, useEffect } from 'react';
import { Printer, Tag, Package, Clock, DollarSign } from 'lucide-react';

// Mock de datos para ver el diseño (luego lo conectamos a tu API)
const pedidosIniciales = [
    {
        id: 1024,
        cliente: "Gaston Mahon",
        detalle: [
            { nombre: "Pizza Fugazzeta Especial", cantidad: 1 },
            { nombre: "Fainá con verdeo", cantidad: 2 },
            { nombre: "Coca Cola 1.5L", cantidad: 1 }
        ],
        total: 12500,
        hora: "20:15",
        metodo: "Efectivo"
    },
    {
        id: 1025,
        cliente: "Julian Gomez",
        detalle: [
            { nombre: "Pizza de Muzzarella", cantidad: 2 },
            { nombre: "Cerveza Quilmes", cantidad: 1 }
        ],
        total: 18200,
        hora: "20:30",
        metodo: "Transferencia"
    }
];

const Orders = () => {
    const [pedidos, setPedidos] = useState(pedidosIniciales);

    const handlePrintInvoice = (id) => {
        console.log(`Imprimiendo Factura del pedido #${id}`);
        // Aquí iría la lógica de react-to-print o window.print()
    };

    const handlePrintLabel = (id) => {
        console.log(`Imprimiendo Etiqueta de envío del pedido #${id}`);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Pedidos <span className="text-orange-600">En Tiempo Real</span>
                </h1>
                <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold animate-pulse">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    {pedidos.length} Pedidos Activos
                </div>
            </header>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidos.map((pedido) => (
                    <div
                        key={pedido.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
                    >
                        {/* Header de la Card */}
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400">#{pedido.id}</span>
                            <div className="flex items-center text-gray-500 text-xs font-semibold">
                                <Clock size={14} className="mr-1" /> {pedido.hora}
                            </div>
                        </div>

                        {/* Cuerpo del Pedido */}
                        <div className="p-5 flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                <Package size={18} className="text-orange-500" />
                                {pedido.cliente}
                            </h3>

                            <ul className="space-y-2 mb-4">
                                {pedido.detalle.map((item, index) => (
                                    <li key={index} className="flex justify-between text-sm text-gray-600 border-b border-dashed border-gray-100 pb-1">
                                        <span><span className="font-bold text-gray-800">{item.cantidad}x</span> {item.nombre}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-between items-center mt-4 p-3 bg-orange-50 rounded-xl">
                                <span className="text-orange-800 font-bold flex items-center gap-1">
                                    <DollarSign size={16} /> Total
                                </span>
                                <span className="text-xl font-black text-orange-700">
                                    ${pedido.total.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="p-4 bg-white grid grid-cols-2 gap-3 border-t border-gray-100">
                            <button
                                onClick={() => handlePrintInvoice(pedido.id)}
                                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                            >
                                <Printer size={16} /> Factura
                            </button>
                            <button
                                onClick={() => handlePrintLabel(pedido.id)}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                            >
                                <Tag size={16} /> Etiqueta
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;