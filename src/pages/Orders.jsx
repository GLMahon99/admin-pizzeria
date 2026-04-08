import { useState, useMemo } from 'react';
import { Printer, Tag, Package, Clock, DollarSign, Calendar } from 'lucide-react';

const Orders = () => {
    // Estado para el filtro seleccionado
    const [filter, setFilter] = useState('Hoy');

    // Datos mockeados con fechas para probar el filtro
    const [pedidos] = useState([
        { id: 1024, cliente: "Gaston Mahon", total: 12500, fecha: new Date(), detalle: [{ nombre: 'Muzza', cantidad: 1 }], hora: "12:30" },
        { id: 1020, cliente: "Marcos Paz", total: 8500, fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), detalle: [{ nombre: 'Fugazzeta', cantidad: 1 }], hora: "21:15" },
        { id: 1010, cliente: "Ana Clara", total: 9100, fecha: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), detalle: [{ nombre: 'Napo', cantidad: 1 }], hora: "20:00" },
    ]);

    // Lógica de filtrado (Memoizada para rendimiento de datos)
    const filteredOrders = useMemo(() => {
        const now = new Date();
        return pedidos.filter(order => {
            const orderDate = new Date(order.fecha);
            const diffTime = Math.abs(now - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (filter === 'Hoy') {
                return orderDate.toDateString() === now.toDateString();
            }
            if (filter === '7d') {
                return diffDays <= 7;
            }
            if (filter === '30d') {
                return diffDays <= 30;
            }
            return true; // "Todos"
        });
    }, [filter, pedidos]);

    const filterOptions = [
        { label: 'Hoy', value: 'Hoy' },
        { label: 'Últimos 7 días', value: '7d' },
        { label: 'Últimos 30 días', value: '30d' },
        { label: 'Todos', value: 'Todos' },
    ];

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        Gestión de <span className="text-orange-600">Pedidos</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Visualizá y filtrá las ventas del local</p>
                </div>

                {/* Badge de contador dinámico */}
                <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-2xl font-bold">
                    <Package size={18} />
                    {filteredOrders.length} {filter === 'Hoy' ? 'hoy' : 'encontrados'}
                </div>
            </header>

            {/* Barra de Filtros Estilo "Pills" */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2">
                {filterOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === opt.value
                                ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Grid de Pedidos Filtrados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((pedido) => (
                        <div key={pedido.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-t-4 border-t-orange-500">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">#{pedido.id}</span>
                                    <div className="flex items-center text-gray-400 text-xs font-bold bg-gray-50 px-2 py-1 rounded-lg">
                                        <Clock size={12} className="mr-1" /> {pedido.hora}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1">{pedido.cliente}</h3>
                                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(pedido.fecha).toLocaleDateString()}
                                </p>

                                <ul className="space-y-2 mb-6">
                                    {pedido.detalle.map((item, idx) => (
                                        <li key={idx} className="flex justify-between text-sm text-gray-600">
                                            <span><span className="font-black text-gray-800">{item.cantidad}x</span> {item.nombre}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total</span>
                                    <span className="text-xl font-black text-orange-600">${pedido.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-2 gap-3 bg-white border-t border-gray-50">
                                <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white py-3 rounded-xl text-xs font-bold transition-all active:scale-95">
                                    <Printer size={16} /> Factura
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold transition-all active:scale-95">
                                    <Tag size={16} /> Etiqueta
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-bold">No se encontraron pedidos en este rango.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;