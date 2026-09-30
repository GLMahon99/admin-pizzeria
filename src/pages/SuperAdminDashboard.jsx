import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import SuperAdminPlans from '../components/SuperAdminPlans';
import * as XLSX from 'xlsx';
import {
    ShieldCheck,
    Store,
    Users,
    ShoppingBag,
    DollarSign,
    Package,
    TrendingUp,
    Calendar,
    Search,
    ExternalLink,
    Wrench,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    DownloadCloud,
    RefreshCw,
    LogOut,
    MessageCircle,
    Mail,
    MapPin,
    FileSpreadsheet,
    Eye,
    Zap,
    X,
    Filter
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#64748b'];

const SuperAdminDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [plans, setPlans] = useState([]);
    const [plansHistorial, setPlansHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, PENDING, EXPIRED

    // Estado del modal de gestión de suscripción
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [subStatus, setSubStatus] = useState('ACTIVE');
    const [subPlan, setSubPlan] = useState('PREMIUM_MONTHLY');
    const [subExpDate, setSubExpDate] = useState('');
    const [savingSub, setSavingSub] = useState(false);

    // Estado para soporte / impersonación
    const [impersonatingId, setImpersonatingId] = useState(null);

    // Cargar datos del dashboard
    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, companiesRes, plansRes] = await Promise.all([
                api.get('/superadmin/stats'),
                api.get('/superadmin/companies'),
                api.get('/superadmin/plans')
            ]);
            setStats(statsRes.data);
            setCompanies(companiesRes.data);
            setPlans(plansRes.data.plans);
            setPlansHistorial(plansRes.data.historial);
        } catch (error) {
            console.error('Error al cargar datos de Super Admin:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/superadmin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('superadmin_token');
        if (!token) {
            navigate('/superadmin/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('superadmin_user');
        navigate('/superadmin/login');
    };

    // Abrir modal de edición de suscripción
    const handleOpenModal = (company) => {
        setSelectedCompany(company);
        setSubStatus(company.suscripcion_status || 'PENDING');
        setSubPlan(company.suscripcion_plan || 'PREMIUM_MONTHLY');
        setSubExpDate(company.suscripcion_expiracion ? new Date(company.suscripcion_expiracion).toISOString().split('T')[0] : '');
        setModalOpen(true);
    };

    // Guardar cambios de suscripción
    const handleSaveSubscription = async (e) => {
        e.preventDefault();
        if (!selectedCompany) return;

        try {
            setSavingSub(true);
            await api.put(`/superadmin/companies/${selectedCompany.empresa_id}/subscription`, {
                suscripcion_status: subStatus,
                suscripcion_plan: subPlan,
                suscripcion_expiracion: subExpDate ? `${subExpDate} 23:59:59` : null
            });

            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar suscripción:', error);
            alert('Hubo un error al actualizar la suscripción: ' + (error.response?.data?.message || error.message));
        } finally {
            setSavingSub(false);
        }
    };

    // Agregar días rápidos a la fecha de expiración
    const handleAddDays = (days) => {
        const base = subExpDate ? new Date(subExpDate) : new Date();
        base.setDate(base.getDate() + days);
        setSubExpDate(base.toISOString().split('T')[0]);
    };

    // Impersonar empresa (Soporte Técnico en 1 Clic)
    const handleImpersonate = async (company) => {
        if (!window.confirm(`¿Deseas acceder al panel administrativo de "${company.nombre}" en modo soporte?`)) {
            return;
        }

        try {
            setImpersonatingId(company.empresa_id);
            const response = await api.post(`/superadmin/companies/${company.empresa_id}/impersonate`);
            const { token, empresa } = response.data;

            // Guardar credenciales de sesión de la empresa
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(empresa));

            // Abrir el panel de la empresa en una nueva pestaña o ventana
            window.open('/', '_blank');
        } catch (error) {
            console.error('Error al impersonar empresa:', error);
            alert('Error al acceder al panel del cliente: ' + (error.response?.data?.message || error.message));
        } finally {
            setImpersonatingId(null);
        }
    };

    // Exportar datos a Excel
    const handleExportExcel = () => {
        try {
            const dataToExport = companies.map(c => ({
                'ID': c.empresa_id,
                'Nombre Local': c.nombre,
                'Slug': c.slug,
                'CUIT/CUIL': c.cuit_cuil || '-',
                'Email Contacto': c.email_contacto || '-',
                'WhatsApp': c.whatsapp || '-',
                'Dirección': c.direccion || '-',
                'Ciudad': c.ciudad || '-',
                'Estado Suscripción': c.suscripcion_status || 'PENDING',
                'Plan': c.suscripcion_plan ? planLabel(c.suscripcion_plan) : '-',
                'Vencimiento': c.suscripcion_expiracion ? new Date(c.suscripcion_expiracion).toLocaleDateString() : 'Sin vencimiento',
                'Total Pedidos': c.total_pedidos || 0,
                'Ventas Totales ($)': parseFloat(c.total_ventas || 0),
                'Productos en Menú': c.total_productos || 0,
                'Clientes Registrados': c.total_clientes || 0,
                'AFIP Habilitado': c.afip_habilitado ? 'SI' : 'NO',
                'Control Insumos': c.control_insumos ? 'SI' : 'NO',
                'Términos Aceptados': c.terminos_aceptados ? 'SI' : 'NO'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Pizzerias Clientes');
            XLSX.writeFile(wb, `Reporte_Clientes_Acommerr_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            alert('Error al generar el archivo Excel.');
        }
    };

    // Filtrar pizzerías
    const filteredCompanies = companies.filter(company => {
        const matchesSearch =
            (company.nombre && company.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (company.slug && company.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (company.cuit_cuil && company.cuit_cuil.includes(searchTerm)) ||
            (company.email_contacto && company.email_contacto.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (company.ciudad && company.ciudad.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'ACTIVE') return company.suscripcion_status === 'ACTIVE';
        if (filterStatus === 'PENDING') return company.suscripcion_status === 'PENDING';
        if (filterStatus === 'EXPIRED') return company.suscripcion_status === 'EXPIRED' || company.suscripcion_status === 'CANCELLED';

        return true;
    });

    const planLabel = (idPlan) => plans.find(p => p.id_plan === idPlan)?.nombre || 'Sin plan';

    // Datos para gráfico de distribución de suscripciones
    const pieData = [
        { name: 'Activas', value: stats?.empresas?.empresas_activas || 0 },
        { name: 'Pendientes', value: stats?.empresas?.empresas_pendientes || 0 },
        { name: 'Vencidas', value: stats?.empresas?.empresas_vencidas || 0 }
    ].filter(item => item.value > 0);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
            {/* Header Superior */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-tr from-gold-600 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20 border border-gold-400/30">
                            <ShieldCheck className="text-slate-950 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                Acommerr <span className="text-gold-500 font-mono text-xs uppercase px-2 py-0.5 bg-gold-500/10 border border-gold-500/30 rounded-md">Master Platform</span>
                            </h1>
                            <p className="text-xs text-slate-400">Panel Central de Gestión de Clientes y Plataforma</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            title="Recargar datos"
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                            <FileSpreadsheet size={16} />
                            <span>Exportar Excel</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                            <LogOut size={16} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-8">
                {/* BANNER DE BIENVENIDA */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                                <Zap size={12} /> Visión General de la Red
                            </span>
                            <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
                                Monitoreo Global de Clientes y Ventas
                            </h2>
                            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                                Visualiza en tiempo real el estado de todas las pizzerías registradas, sus suscripciones activas, volumen transaccionado y brinda soporte con un solo clic.
                            </p>
                        </div>
                    </div>
                </div>

                {/* TARJETAS DE KPIS GLOBALES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Card 1: Total Pizzerías */}
                    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pizzerías Clientes</span>
                            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                                <Store size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{stats?.empresas?.total_empresas || 0}</span>
                            <span className="text-xs text-slate-400 font-medium">registradas</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 size={13} /> {stats?.empresas?.empresas_activas || 0} Activas
                            </span>
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                                <Clock size={13} /> {stats?.empresas?.empresas_pendientes || 0} Pend.
                            </span>
                            <span className="text-red-400 font-bold flex items-center gap-1">
                                <AlertTriangle size={13} /> {stats?.empresas?.empresas_vencidas || 0} Venc.
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Volumen Total de Ventas ($ GMV) */}
                    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volumen de Ventas (GMV)</span>
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">
                                ${parseFloat(stats?.pedidos?.volumen_total_ventas || 0).toLocaleString('es-AR')}
                            </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>Últimos 30 días:</span>
                            <span className="font-bold text-slate-200">
                                ${parseFloat(stats?.pedidos?.ventas_ultimos_30d || 0).toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Total Pedidos en Plataforma */}
                    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pedidos Procesados</span>
                            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                                <ShoppingBag size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{stats?.pedidos?.total_pedidos || 0}</span>
                            <span className="text-xs text-slate-400 font-medium">totales</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>Pedidos de hoy:</span>
                            <span className="font-bold text-amber-400">{stats?.pedidos?.pedidos_hoy || 0}</span>
                        </div>
                    </div>

                    {/* Card 4: Clientes y Catálogo */}
                    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Comensales & Menú</span>
                            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                                <Users size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{stats?.total_clientes || 0}</span>
                            <span className="text-xs text-slate-400 font-medium">usuarios registrados</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>Productos en menú:</span>
                            <span className="font-bold text-purple-400">{stats?.total_productos || 0} items</span>
                        </div>
                    </div>
                </div>

                {/* GRÁFICOS DE RENDIMIENTO */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Evolución de Pedidos y Ventas */}
                    <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="text-gold-500 w-4 h-4" /> Evolución de Actividad (Últimos 14 Días)
                                </h3>
                                <p className="text-xs text-slate-400">Cantidad de pedidos y transacciones a través de la plataforma</p>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            {stats?.evolucionPedidos && stats.evolucionPedidos.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.evolucionPedidos}>
                                        <defs>
                                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                                        <YAxis stroke="#94a3b8" fontSize={11} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#334155',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                color: '#f8fafc'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pedidos"
                                            name="Pedidos"
                                            stroke="#f59e0b"
                                            fillOpacity={1}
                                            fill="url(#colorVentas)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                                    No hay suficientes datos de actividad reciente para mostrar el gráfico.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gráfico de Distribución de Suscripciones */}
                    <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white mb-1">
                                Estado de Suscripciones
                            </h3>
                            <p className="text-xs text-slate-400">Distribución de clientes según estado de cuenta</p>
                        </div>

                        <div className="h-52 w-full my-2">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#334155',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                color: '#f8fafc'
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                                    Sin suscripciones registradas.
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                            <div className="bg-slate-950 p-2.5 rounded-xl text-center">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Premium</span>
                                <span className="text-gold-400 font-black text-sm">{stats?.empresas?.planes_premium || 0}</span>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-xl text-center">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clásica</span>
                                <span className="text-orange-400 font-black text-sm">{stats?.empresas?.planes_clasica || 0}</span>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-xl text-center">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Plan Mensual</span>
                                <span className="text-white font-black text-sm">{stats?.empresas?.planes_mensuales || 0}</span>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-xl text-center">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Plan Anual</span>
                                <span className="text-white font-black text-sm">{stats?.empresas?.planes_anuales || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PLANES Y PRECIOS */}
                {plans.length > 0 && (
                    <SuperAdminPlans plans={plans} historial={plansHistorial} onSaved={fetchData} />
                )}

                {/* TABLA PRINCIPAL DE GESTIÓN DE CLIENTES */}
                <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                    {/* Header y Filtros de la Tabla */}
                    <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Store className="text-gold-500 w-5 h-5" /> Directorio de Pizzerías Clientes
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Total: {filteredCompanies.length} de {companies.length} locales registrados
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Barra de Búsqueda */}
                            <div className="relative min-w-[240px]">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar pizzería, CUIT, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-all"
                                />
                            </div>

                            {/* Filtros por Estado */}
                            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                                {[
                                    { id: 'ALL', label: 'Todas' },
                                    { id: 'ACTIVE', label: 'Activas' },
                                    { id: 'PENDING', label: 'Pendientes' },
                                    { id: 'EXPIRED', label: 'Vencidas' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilterStatus(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            filterStatus === tab.id
                                                ? 'bg-gold-500 text-slate-950 shadow'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-4 px-6">Local / Pizzería</th>
                                    <th className="py-4 px-4">Contacto</th>
                                    <th className="py-4 px-4">Ubicación</th>
                                    <th className="py-4 px-4">Suscripción</th>
                                    <th className="py-4 px-4 text-right">Pedidos</th>
                                    <th className="py-4 px-4 text-right">Ventas Totales</th>
                                    <th className="py-4 px-4 text-center">Módulos</th>
                                    <th className="py-4 px-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300 font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-500">
                                            Cargando directorio de clientes...
                                        </td>
                                    </tr>
                                ) : filteredCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-500">
                                            No se encontraron pizzerías que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompanies.map(company => {
                                        const isExpired = company.suscripcion_status === 'EXPIRED' ||
                                            (company.suscripcion_status === 'ACTIVE' && company.suscripcion_expiracion && new Date(company.suscripcion_expiracion) < new Date());
                                        const isActive = company.suscripcion_status === 'ACTIVE' && !isExpired;
                                        const isPending = company.suscripcion_status === 'PENDING';

                                        return (
                                            <tr key={company.empresa_id} className="hover:bg-slate-800/40 transition-colors">
                                                {/* Local / Identificación */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {company.logo_url ? (
                                                            <img
                                                                src={company.logo_url}
                                                                alt={company.nombre}
                                                                className="w-10 h-10 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-gold-500 font-black border border-slate-700 flex-shrink-0">
                                                                {company.nombre?.charAt(0) || 'P'}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-white truncate flex items-center gap-1.5">
                                                                <span>{company.nombre}</span>
                                                                <span className="text-[10px] text-slate-500 font-mono">#{company.empresa_id}</span>
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 font-mono truncate">
                                                                CUIT: {company.cuit_cuil || 'Sin CUIT'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contacto */}
                                                <td className="py-4 px-4">
                                                    <div className="space-y-1">
                                                        {company.email_contacto && (
                                                            <a
                                                                href={`mailto:${company.email_contacto}`}
                                                                className="flex items-center gap-1.5 text-slate-300 hover:text-gold-400 transition-colors truncate max-w-[180px]"
                                                                title={company.email_contacto}
                                                            >
                                                                <Mail size={12} className="text-slate-500 flex-shrink-0" />
                                                                <span className="truncate">{company.email_contacto}</span>
                                                            </a>
                                                        )}
                                                        {company.whatsapp && (
                                                            <a
                                                                href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 text-emerald-400 hover:underline transition-colors"
                                                            >
                                                                <MessageCircle size={12} className="flex-shrink-0" />
                                                                <span>{company.whatsapp}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Ubicación */}
                                                <td className="py-4 px-4">
                                                    <div className="text-slate-400 truncate max-w-[150px]">
                                                        {company.direccion || company.ciudad ? (
                                                            <span className="flex items-center gap-1" title={`${company.direccion || ''} ${company.ciudad || ''}`}>
                                                                <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                                                                <span className="truncate">{company.ciudad || company.direccion}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-600 italic">No especificada</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Suscripción & Plan */}
                                                <td className="py-4 px-4">
                                                    <div className="space-y-1">
                                                        <div>
                                                            {isActive && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                                    <CheckCircle2 size={10} /> ACTIVA
                                                                </span>
                                                            )}
                                                            {isPending && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                                                    <Clock size={10} /> PENDIENTE
                                                                </span>
                                                            )}
                                                            {isExpired && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                                                    <XCircle size={10} /> VENCIDA
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">
                                                            {planLabel(company.suscripcion_plan)}
                                                            {company.suscripcion_expiracion && (
                                                                <span className="block text-[10px] text-slate-500">
                                                                    Vence: {new Date(company.suscripcion_expiracion).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Pedidos */}
                                                <td className="py-4 px-4 text-right font-mono font-bold text-white">
                                                    {company.total_pedidos || 0}
                                                </td>

                                                {/* Ventas Totales */}
                                                <td className="py-4 px-4 text-right font-mono font-bold text-emerald-400">
                                                    ${parseFloat(company.total_ventas || 0).toLocaleString('es-AR')}
                                                </td>

                                                {/* Módulos */}
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <span
                                                            title={company.afip_habilitado ? "Facturación AFIP Habilitada" : "AFIP No Configurado"}
                                                            className={`px-1.5 py-0.5 text-[9px] font-black rounded ${
                                                                company.afip_habilitado
                                                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                                    : 'bg-slate-800 text-slate-600'
                                                            }`}
                                                        >
                                                            AFIP
                                                        </span>
                                                        <span
                                                            title={company.control_insumos ? "Control de Insumos Activo" : "Insumos Desactivado"}
                                                            className={`px-1.5 py-0.5 text-[9px] font-black rounded ${
                                                                company.control_insumos
                                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                                    : 'bg-slate-800 text-slate-600'
                                                            }`}
                                                        >
                                                            INSUMOS
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Acciones */}
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Botón Gestión de Suscripción */}
                                                        <button
                                                            onClick={() => handleOpenModal(company)}
                                                            title="Editar Suscripción y Vencimiento"
                                                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
                                                        >
                                                            <Wrench size={14} />
                                                        </button>

                                                        {/* Botón Acceder como Local (Soporte Técnico) */}
                                                        <button
                                                            onClick={() => handleImpersonate(company)}
                                                            disabled={impersonatingId === company.empresa_id}
                                                            title="Ingresar como este Local (Soporte Técnico)"
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                                        >
                                                            <Zap size={13} className={impersonatingId === company.empresa_id ? 'animate-spin' : ''} />
                                                            <span>Soporte</span>
                                                        </button>

                                                        {/* Botón Abrir Tienda */}
                                                        {company.slug && (
                                                            <a
                                                                href={`http://${company.slug}.localhost:5173`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Ver Tienda Online"
                                                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-all active:scale-95"
                                                            >
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL PARA GESTIONAR SUSCRIPCIÓN */}
            {modalOpen && selectedCompany && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/20">
                                    <Wrench size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white">Gestionar Suscripción</h4>
                                    <p className="text-xs text-slate-400">{selectedCompany.nombre} (#{selectedCompany.empresa_id})</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSubscription} className="p-6 space-y-5">
                            {/* Estado de Suscripción */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                    Estado de la Cuenta
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'ACTIVE', label: 'Activa', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/30' },
                                        { id: 'PENDING', label: 'Pendiente', icon: Clock, color: 'text-amber-400 border-amber-500/30' },
                                        { id: 'EXPIRED', label: 'Vencida', icon: XCircle, color: 'text-red-400 border-red-500/30' }
                                    ].map(item => {
                                        const Icon = item.icon;
                                        const isSelected = subStatus === item.id;
                                        return (
                                            <button
                                                type="button"
                                                key={item.id}
                                                onClick={() => setSubStatus(item.id)}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? `bg-slate-800 ${item.color} ring-1 ring-gold-500 shadow-md`
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                <Icon size={14} className={item.color.split(' ')[0]} />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Plan Contratado */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                    Tipo de Plan
                                </label>
                                <select
                                    value={subPlan}
                                    onChange={(e) => setSubPlan(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
                                >
                                    {plans.map(p => (
                                        <option key={p.id_plan} value={p.id_plan}>
                                            {p.nombre} — ${parseFloat(p.precio).toLocaleString('es-AR')}{p.activo ? '' : ' (inactivo)'}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-500 mt-1.5">
                                    Si el plan no incluye facturación automática, se desactiva AFIP en la empresa.
                                </p>
                            </div>

                            {/* Fecha de Expiración */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                    Fecha de Vencimiento
                                </label>
                                <input
                                    type="date"
                                    value={subExpDate}
                                    onChange={(e) => setSubExpDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500 mb-2"
                                />

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAddDays(30)}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                        +30 Días
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddDays(365)}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                        +1 Año
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubExpDate('')}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs transition-all cursor-pointer"
                                    >
                                        Sin Vencimiento
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSub}
                                    className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-gold-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                    {savingSub ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
