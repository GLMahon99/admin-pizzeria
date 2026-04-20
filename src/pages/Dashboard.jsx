import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
    TrendingUp, Users, ShoppingCart, DollarSign,
    UserPlus, Star, ArrowUpRight, DownloadCloud
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#f9804d', '#37386d', '#384a62', '#10b981', '#f59e0b', '#6366f1'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rango, setRango] = useState('14dias');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/stats?rango=${rango}`);
            setStats(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [rango]);

    const handleDownloadExcel = async () => {
        try {
            const response = await api.get('/pedidos');
            const orders = response.data;
            
            // Format data for excel
            const excelData = orders.map(order => ({
                'ID Pedido': order.id_pedido,
                'Fecha': new Date(order.fecha).toLocaleString(),
                'Cliente': order.cliente_nombre || 'Mostrador',
                'Teléfono': order.telefono || '-',
                'Total ($)': parseFloat(order.total),
                'Estado': order.estado || 'ENTREGADO'
            }));

            // Create worksheet and workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Balance Ventas');
            
            // Generate and download
            XLSX.writeFile(workbook, `Balance_Ventas_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
        } catch (error) {
            console.error('Error al descargar el Excel:', error);
            alert('Hubo un error al generar el balance.');
        }
    };

    if (loading || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.3em] font-black text-xs text-orange-600">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mr-4"></div>
                Analizando el negocio...
            </div>
        );
    }

    const { kpis, ventasSemanales, topProductos, ventasPorHorario, ventasPorCategoria, recientes } = stats;
    
    // Format horas para el gráfico
    const dataHorarios = ventasPorHorario?.map(item => ({
        hora: `${item.hora}:00`,
        pedidos: item.cantidad
    })) || [];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">Panel de <span className="text-orange-600">Alta Gerencia</span></h1>
                    <p className="text-gray-500">Métricas clave, comportamiento de usuarios y pronóstico de ventas.</p>
                </div>
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 px-6 py-3 bg-[#384a62] hover:bg-[#242f3d] text-white rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 hover:-translate-y-1"
                >
                    <DownloadCloud size={20} />
                    Exportar Balance (.xlsx)
                </button>
            </header>

            {/* 1. KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Ventas Hoy (Bruto)" value={`$${Math.round(kpis.ventas_hoy).toLocaleString() || 0}`} icon={<DollarSign className="text-[#10b981]" />} trend="+15%" color="bg-[#10b981]/10" />
                <StatCard title="Ventas del Mes" value={`$${Math.round(kpis.ventas_mes || 0).toLocaleString()}`} icon={<ShoppingCart className="text-[#37386d]" />} trend="Estable" color="bg-[#37386d]/10" />
                <StatCard title="Ticket Promedio" value={`$${Math.round(kpis.ticket_promedio).toLocaleString() || 0}`} icon={<TrendingUp className="text-[#f9804d]" />} trend="+8%" color="bg-[#f9804d]/10" />
                <StatCard title="Últimos 30 días" value={`${kpis.clientes_recientes || 0} Clientes`} icon={<UserPlus className="text-[#384a62]" />} trend="+12%" color="bg-[#384a62]/10" />
            </div>

            {/* 2. Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2A. Evolución de Ventas (Area Chart) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-800">Crecimiento de Ventas</h2>
                            <p className="text-sm text-gray-500 font-medium">Evolución temporal del negocio</p>
                        </div>
                        <select 
                            value={rango}
                            onChange={(e) => setRango(e.target.value)}
                            className="text-sm bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 outline-none font-bold text-[#384a62] cursor-pointer hover:border-[#f9804d] transition-colors"
                        >
                            <option value="hoy">Hoy</option>
                            <option value="14dias">Últimos 14 días</option>
                            <option value="30dias">Últimos 30 días</option>
                            <option value="6meses">Últimos 6 meses</option>
                            <option value="1ano">Último año</option>
                            <option value="todo">Histórico completo</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ventasSemanales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f9804d" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#f9804d" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="ventas" stroke="#f9804d" strokeWidth={4} fillOpacity={1} fill="url(#colorVentas)" dot={{ r: 4, fill: '#fff', stroke: '#f9804d', strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2B. Distribución de Ventas (Pie Chart) */}
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col">
                    <div>
                        <h2 className="text-xl font-black text-gray-800">Distribución de Ventas</h2>
                        <p className="text-sm text-gray-500 font-medium">Categorías más solicitadas</p>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ventasPorCategoria}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {ventasPorCategoria?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Secondary Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3A. Horas Pico (Bar Chart) */}
                <div className="lg:col-span-2 bg-[#242f3d] p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-[#384a62]/50">
                    <div>
                        <h2 className="text-xl font-black text-white">Mapa de Horas Pico</h2>
                        <p className="text-sm text-gray-400 font-medium">Volumen de pedidos según franja horaria (hace 30 días)</p>
                    </div>
                    <div className="h-80 w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataHorarios} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#384a62" opacity={0.3} />
                                <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#384a62', opacity: 0.2 }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                                <Bar dataKey="pedidos" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3B. Top Productos */}
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-800">Top Productos</h2>
                            <p className="text-sm text-gray-500 font-medium">Los más vendidos históricos</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductos} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} width={90} tick={{ fill: '#334155', fontSize: 11, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="unidades" fill="#10b981" radius={[0, 8, 8, 0]} barSize={20}>
                                    {topProductos?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Actividad Reciente List */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-gray-800">Transacciones Recientes</h2>
                    <button onClick={() => window.location.href='/pedidos'} className="text-sm font-bold text-[#f9804d] hover:text-[#ea580c] transition-colors">
                        Ver todo el historial
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="pb-4 font-black">Cliente</th>
                                <th className="pb-4 font-black">Hora</th>
                                <th className="pb-4 font-black">Estado</th>
                                <th className="pb-4 font-black text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recientes?.map((venta) => (
                                <tr key={venta.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#384a62]/10 text-[#384a62]">
                                                <Users size={16} />
                                            </div>
                                            <span className="font-bold text-gray-800">{venta.cliente}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm font-medium text-gray-500">
                                        {new Date(venta.hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${venta.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {venta.estado || 'PENDIENTE'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right font-black text-gray-800">
                                        ${parseFloat(venta.total).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Componente pequeño para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, trend, color }) => (
    <div className={`p-6 rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all`}>
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
        
        <div className="flex justify-between items-start relative z-10">
            <div className={`p-3 rounded-2xl ${color} shadow-sm backdrop-blur-sm`}>{icon}</div>
            <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                {trend}
            </span>
        </div>
        <div className="mt-6 relative z-10">
            <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-black text-gray-800 mt-1">{value}</p>
        </div>
    </div>
);

export default Dashboard;