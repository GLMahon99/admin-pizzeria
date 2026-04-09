import { useState, useMemo, useEffect } from 'react';
import { Printer, Tag, Package, Clock, DollarSign, Calendar, Plus, X, Search, Trash2, ShoppingCart, User, Hash } from 'lucide-react';
import api from '../api/axiosConfig';

const Orders = () => {
    // Estados para la lista y filtros
    const [filter, setFilter] = useState('Hoy');
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para el Modal de Nuevo Pedido
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [newOrder, setNewOrder] = useState({
        cliente: '',
        items: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['Todas', 'Pizzas', 'Empanadas', 'Bebidas', 'Postres'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pedidos');
            setPedidos(response.data);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            alert('No se pudieron cargar los pedidos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (showNewOrderModal) {
            fetchProducts();
        }
    }, [showNewOrderModal]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/productos');
            setAvailableProducts(res.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    const addItemToOrder = (prod) => {
        const exists = newOrder.items.find(item => item.id_producto === prod.id_producto);
        if (exists) {
            setNewOrder({
                ...newOrder,
                items: newOrder.items.map(item => 
                    item.id_producto === prod.id_producto 
                    ? { ...item, cantidad: item.cantidad + 1 } 
                    : item
                )
            });
        } else {
            setNewOrder({
                ...newOrder,
                items: [...newOrder.items, { ...prod, cantidad: 1 }]
            });
        }
    };

    const removeItemFromOrder = (id) => {
        setNewOrder({
            ...newOrder,
            items: newOrder.items.filter(item => item.id_producto !== id)
        });
    };

    const calculateTotal = () => {
        return newOrder.items.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
    };

    const handleConfirmOrder = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const orderData = {
                id_cliente: null, // Para ventas manuales por ahora
                total: calculateTotal(),
                estado: 'Entregado', // Asumimos entregado si es en local
                items: newOrder.items.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio: parseFloat(item.precio)
                }))
            };

            await api.post('/pedidos', orderData);
            
            setShowNewOrderModal(false);
            setNewOrder({ cliente: '', items: [] });
            fetchData(); // Recargar lista
            alert('Pedido registrado con éxito');
        } catch (error) {
            console.error('Error al confirmar pedido:', error);
            alert('Hubo un error al procesar la venta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = availableProducts.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Lógica de filtrado de pedidos existentes
    const filteredOrders = useMemo(() => {
        const now = new Date();
        return pedidos.filter(order => {
            const orderDate = new Date(order.fecha);
            const diffTime = Math.abs(now - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (filter === 'Hoy') return orderDate.toDateString() === now.toDateString();
            if (filter === '7d') return diffDays <= 7;
            if (filter === '30d') return diffDays <= 30;
            return true;
        });
    }, [filter, pedidos]);

    const filterOptions = [
        { label: 'Hoy', value: 'Hoy' },
        { label: 'Últimos 7 días', value: '7d' },
        { label: 'Últimos 30 días', value: '30d' },
        { label: 'Todos', value: 'Todos' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">
                        Gestión de <span className="text-orange-600">Pedidos</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Control total de ventas y despachos</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-200 shadow-sm">
                        <Package size={18} className="text-orange-500" />
                        {filteredOrders.length} {filter === 'Hoy' ? 'hoy' : 'encontrados'}
                    </div>
                    <button 
                        onClick={() => setShowNewOrderModal(true)}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-[2rem] font-black shadow-xl shadow-orange-100 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <Plus size={24} /> Nuevo Pedido
                    </button>
                </div>
            </header>

            {/* Modal Nuevo Pedido */}
            {showNewOrderModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden animate-in fade-in zoom-in duration-300 h-[90vh] flex flex-col border border-white/20">
                        {/* Modal Header */}
                        <div className="bg-orange-600 p-8 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    <ShoppingCart size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Cargar Nuevo Pedido</h2>
                                    <p className="text-orange-100 text-sm font-bold opacity-80 uppercase tracking-widest">Venta por mostrador / Mesa</p>
                                </div>
                            </div>
                            <button onClick={() => setShowNewOrderModal(false)} className="bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all"><X size={24}/></button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Columna Izquierda: Selección de Productos */}
                            <div className="flex-1 p-8 border-r border-gray-100 overflow-y-auto space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar producto..." 
                                            className="w-full pl-12 p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                    selectedCategory === cat
                                                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredProducts.map(prod => (
                                        <button 
                                            key={prod.id_producto}
                                            onClick={() => addItemToOrder(prod)}
                                            className="group bg-white border border-gray-100 p-4 rounded-3xl hover:border-orange-500 hover:shadow-lg transition-all text-left flex flex-col gap-3 active:scale-95"
                                        >
                                            {prod.img ? (
                                                <img src={prod.img} className="w-full h-24 object-cover rounded-2xl" alt={prod.nombre} />
                                            ) : (
                                                <div className="w-full h-24 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-300"><Package size={24}/></div>
                                            )}
                                            <div>
                                                <p className="font-black text-gray-800 leading-tight group-hover:text-orange-600 transition-colors uppercase text-sm">{prod.nombre}</p>
                                                <p className="text-orange-600 font-black mt-1">${parseFloat(prod.precio).toLocaleString()}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Columna Derecha: Detalle del Pedido Actual */}
                            <div className="w-full md:w-[450px] bg-gray-50/50 p-8 flex flex-col border-l border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingCart size={14}/> Detalle del Pedido Actual
                                </h3>


                                <div className="flex-1 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                                    {newOrder.items.length === 0 ? (
                                        <div className="h-full border-4 border-dashed border-gray-100/80 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
                                            <ShoppingCart size={80} className="text-gray-100 mb-8 animate-pulse" />
                                            <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em] leading-loose">
                                                Tu pedido está<br/>
                                                <span className="text-orange-200 font-black">esperando</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {newOrder.items.map(item => (
                                                <div key={item.id_producto} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group animate-in slide-in-from-right-3">
                                                    <div className="flex flex-col flex-1">
                                                        <span className="text-base font-black text-gray-800 uppercase tracking-tighter line-clamp-1">{item.nombre}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">x{item.cantidad}</span>
                                                            <span className="text-xs font-bold text-gray-400">Total: <span className="text-slate-800">${(parseFloat(item.precio) * item.cantidad).toLocaleString()}</span></span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeItemFromOrder(item.id_producto)} 
                                                        className="ml-4 p-4 text-red-100 group-hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={24} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center text-gray-400 uppercase tracking-[0.2em] font-black text-[10px]">
                                        <span>Subtotal</span>
                                        <span>${calculateTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                                        <span className="text-gray-800 font-black text-[10px] uppercase tracking-widest">Total</span>
                                        <span className="text-2xl font-black text-orange-600 tracking-tight">${calculateTotal().toLocaleString()}</span>
                                    </div>
                                    <button 
                                        onClick={handleConfirmOrder}
                                        disabled={newOrder.items.length === 0 || isSubmitting}
                                        className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-2 ${
                                            newOrder.items.length === 0 || isSubmitting
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
                                            : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100'
                                        }`}
                                    >
                                        <DollarSign size={20} /> {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Barra de Filtros */}
            <div className="bg-white p-3 rounded-3xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2">
                {filterOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === opt.value
                                ? 'bg-orange-600 text-white shadow-xl shadow-orange-100'
                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Lista de Pedidos Actuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-32 text-center text-gray-400">
                         <div className="animate-bounce mb-4 text-orange-500"><ShoppingCart size={40} className="mx-auto" /></div>
                         <p className="font-black uppercase tracking-widest text-sm text-gray-400">Cargando las ventas...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((pedido) => (
                        <div key={pedido.id_pedido} className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 border-t-8 border-t-orange-500">
                            <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Orden de Compra</span>
                                        <span className="text-sm font-black text-slate-800 tracking-tight">#{pedido.id_pedido}</span>
                                    </div>
                                    <div className="flex items-center text-slate-500 text-[10px] font-black bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                                        <Clock size={12} className="mr-1.5 text-orange-500" /> {new Date(pedido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-800 text-xl leading-tight">{pedido.cliente_nombre || 'Cliente Mostrador'}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center gap-1.5 mt-0.5">
                                            <Calendar size={10} /> {new Date(pedido.fecha).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100/50 max-h-40 overflow-y-auto custom-scrollbar">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Resumen de Productos</p>
                                    {pedido.detalle && pedido.detalle.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 font-bold"><span className="text-orange-600">x{item.cantidad}</span> {item.producto_nombre}</span>
                                            <span className="text-gray-400 font-bold text-xs">${parseFloat(item.precio_unitario).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center px-2">
                                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Total Cobrado</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">${parseFloat(pedido.total).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50/30 border-t border-gray-100">
                                <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-100">
                                    <Printer size={16} /> Comprobante
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-orange-600 border border-orange-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">
                                    <Tag size={16} /> Etiqueta
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                        <Package size={64} className="mx-auto text-gray-200 mb-6" />
                        <h4 className="text-xl font-black text-gray-400 uppercase tracking-widest">Sin ventas registradas</h4>
                        <p className="text-gray-400 font-bold text-sm">Cargá un nuevo pedido para empezar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;