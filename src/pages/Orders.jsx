import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import api from '../api/axiosConfig';  // Tu instancia de axios  

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Aquí llamarías a tu API: GET /api/admin/orders
        const mockOrders = [
            { id: 1, cliente: 'Juan Perez', total: 4500, estado: 'Pendiente', fecha: '18:30' },
            { id: 2, cliente: 'Maria G.', total: 8200, estado: 'En Horno', fecha: '18:45' },
        ];
        setPedidos(mockOrders);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Pedidos</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Quick Stats Cards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
                    <div className="flex items-center">
                        <Clock className="text-yellow-500 mr-3" />
                        <span className="text-gray-600 font-medium">Pendientes</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">12</p>
                </div>
                {/* ... más tarjetas ... */}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">ID</th>
                            <th className="p-4 font-semibold text-gray-700">Cliente</th>
                            <th className="p-4 font-semibold text-gray-700">Total</th>
                            <th className="p-4 font-semibold text-gray-700">Estado</th>
                            <th className="p-4 font-semibold text-gray-700">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4 text-gray-600">#{order.id}</td>
                                <td className="p-4 font-medium">{order.cliente}</td>
                                <td className="p-4 font-bold text-green-600">${order.total}</td>
                                <td className="p-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                        {order.estado}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">Preparar</button>
                                    <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300">Detalle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;