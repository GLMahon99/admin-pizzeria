import {
    TrendingUp, Users, ShoppingCart, DollarSign,
    UserPlus, Star, ArrowUpRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

// Datos mockeados para el análisis
const dataVentas = [
    { dia: 'Lun', ventas: 45000 },
    { dia: 'Mar', ventas: 52000 },
    { dia: 'Mie', ventas: 48000 },
    { dia: 'Jue', ventas: 61000 },
    { dia: 'Vie', ventas: 89000 },
    { dia: 'Sab', ventas: 95000 },
    { dia: 'Dom', ventas: 82000 },
];

const dataProductos = [
    { nombre: 'Muzza', unidades: 120 },
    { nombre: 'Fugazzeta', unidades: 85 },
    { nombre: 'Napo', unidades: 64 },
    { nombre: 'Calzone', unidades: 42 },
    { nombre: 'Emp. Carne', unidades: 156 }, // ¡Las empanadas suelen volar!
    { nombre: 'Cerveza', unidades: 92 },
];

const ventasRecientes = [
    { id: 2045, cliente: "Gaston Mahon", total: 12500, tipo: "Nuevo", hora: "hace 5 min" },
    { id: 2044, cliente: "Laura Soler", total: 8400, tipo: "Recurrente", hora: "hace 12 min" },
    { id: 2043, cliente: "Marcos Paz", total: 15200, tipo: "Nuevo", hora: "hace 18 min" },
    { id: 2042, cliente: "Ana Clara", total: 9100, tipo: "Recurrente", hora: "hace 25 min" },
];

const Dashboard = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-extrabold text-gray-800">Panel de <span className="text-orange-600">Control</span></h1>
                <p className="text-gray-500">Bienvenido, acá tenés el pulso de la pizzería hoy.</p>
            </header>

            {/* 1. KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Ventas Hoy" value="$125.400" icon={<DollarSign className="text-green-600" />} trend="+12%" color="bg-green-50" />
                <StatCard title="Pedidos" value="48" icon={<ShoppingCart className="text-blue-600" />} trend="+5%" color="bg-blue-50" />
                <StatCard title="Ticket Promedio" value="$2.612" icon={<TrendingUp className="text-purple-600" />} trend="+2%" color="bg-purple-50" />
                <StatCard title="Clientes Nuevos" value="14" icon={<UserPlus className="text-orange-600" />} trend="+18%" color="bg-orange-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Gráfico de Ventas Semanales */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Evolución de Ventas</h2>
                        <select className="text-sm bg-gray-50 border-none rounded-lg p-2 outline-none font-medium">
                            <option>Últimos 7 días</option>
                            <option>Este mes</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataVentas}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="ventas" stroke="#ea580c" strokeWidth={4} dot={{ r: 6, fill: '#ea580c', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Ventas Recientes con Lógica de Cliente Nuevo */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Actividad Reciente</h2>
                    <div className="space-y-6">
                        {ventasRecientes.map((venta) => (
                            <div key={venta.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${venta.tipo === 'Nuevo' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {venta.tipo === 'Nuevo' ? <Star size={18} fill="currentColor" /> : <Users size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{venta.cliente}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 font-medium">{venta.hora}</span>
                                            {venta.tipo === 'Nuevo' && (
                                                <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">Nuevo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-gray-700">${venta.total.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 text-sm font-bold text-orange-600 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors">
                        Ver todos los pedidos
                    </button>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Top Productos <span className="text-orange-600">(Unidades)</span></h2>
                        <span className="text-xs text-gray-400 font-medium">Este Mes</span>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dataProductos}
                                layout="vertical" // Lo ponemos horizontal para que los nombres largos se lean bien
                                margin={{ left: 20, right: 30 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="nombre"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#fff7ed' }}
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="unidades"
                                    fill="#ea580c"
                                    radius={[0, 10, 10, 0]} // Bordes redondeados en la punta de la barra
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente pequeño para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, trend, color }) => (
    <div className={`p-6 rounded-3xl ${color} border border-white shadow-sm`}>
        <div className="flex justify-between items-start">
            <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-white px-2 py-1 rounded-lg">
                {trend} <ArrowUpRight size={12} />
            </span>
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-black text-gray-800">{value}</p>
        </div>
    </div>
);

export default Dashboard;