import { useState, useMemo, useEffect } from 'react';
import { Printer, Tag, Package, Clock, DollarSign, Calendar, Plus, X, Search, Trash2, ShoppingCart, User, Hash, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { parseAddress } from '../utils/formatters';

const Orders = () => {
    const { user } = useAuth();
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

    const fetchData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/pedidos');
            setPedidos(response.data);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            if (!silent) alert('No se pudieron cargar los pedidos.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        // Carga inicial
        fetchData();

        // Polling silencioso cada 12 segundos
        const interval = setInterval(() => {
            fetchData(true);
        }, 12000);

        return () => clearInterval(interval);
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
    const handlePrintTicket = (pedido) => {
        // Crear un iframe oculto para la impresión si no existe
        let iframe = document.getElementById('print-iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'print-iframe';
            iframe.style.position = 'absolute';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
        }

        const fechaFormat = new Date(pedido.fecha).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) + ' ' + 
                           new Date(pedido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' });
        
        const currentOrigin = window.location.origin;
        const deliveryUrl = `${currentOrigin}/reparto?pedido=${pedido.id_pedido}&tenant=${user?.slug || 'pizzeria'}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(deliveryUrl)}`;

        const addr = parseAddress(pedido.cliente_direccion);

        const html = `
            <html>
            <head>
                <title>Ticket #${pedido.id_pedido}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; width: 280px; font-size: 12px; margin: 0; padding: 10px; }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total { display: flex; justify-content: space-between; font-size: 16px; margin-top: 10px; }
                    .afip-placeholder { border: 1px solid #000; padding: 5px; margin-top: 15px; font-size: 10px; }
                    @media print { body { margin: 0; padding: 10px; } }
                </style>
            </head>
            <body>
                <div class="center bold" style="font-size: 18px;">${user?.nombre || 'A-COMMERR ERP'}</div>
                <div class="center text-gray-500">${user?.direccion || 'Florida, Vicente López'}</div>
                <div class="divider"></div>
                <div class="bold">ORDEN: #${pedido.id_pedido}</div>
                <div>FECHA: ${fechaFormat}</div>
                <div class="bold">MÉTODO: ${pedido.metodo_entrega === 'takeaway' ? 'RETIRO POR LOCAL 🛍️' : 'ENVÍO A DOMICILIO 🛵'}</div>
                <div class="divider"></div>
                
                <div class="bold">CLIENTE:</div>
                <div>${pedido.cliente_nombre || 'Cliente Mostrador'}</div>
                
                ${pedido.metodo_entrega !== 'takeaway' && pedido.cliente_direccion ? `
                    <div class="bold" style="margin-top: 5px;">DIRECCIÓN DE ENVÍO:</div>
                    <div>${addr.calle} ${addr.altura}</div>
                    ${(addr.piso || addr.depto) ? `<div>Piso: ${addr.piso || '-'} | Depto: ${addr.depto || '-'}</div>` : ''}
                    ${addr.cp ? `<div>Código Postal: ${addr.cp}</div>` : ''}
                    ${addr.observaciones ? `<div class="bold" style="margin-top: 5px;">NOTAS DE ENTREGA:</div><div style="font-style: italic;">${addr.observaciones}</div>` : ''}
                ` : ''}
                
                <div class="divider"></div>
                <div class="bold">PRODUCTOS:</div>
                ${pedido.detalle ? pedido.detalle.map(item => `
                    <div class="item">
                        <span>${item.cantidad}x ${item.producto_nombre}</span>
                        <span>$${(item.cantidad * item.precio_unitario).toLocaleString()}</span>
                    </div>
                `).join('') : 'Sin detalle'}
                
                <div class="divider"></div>
                <div class="total bold">
                    <span>TOTAL:</span>
                    <span>$${parseFloat(pedido.total).toLocaleString()}</span>
                </div>
                
                <div class="divider"></div>
                
                ${pedido.metodo_entrega === 'takeaway' ? `
                <div class="center bold" style="margin-top: 15px; margin-bottom: 15px; border: 2px solid #000; padding: 12px; font-size: 14px; font-family: sans-serif;">
                    RETIRO POR LOCAL 🛍️
                </div>
                ` : `
                <!-- QR de Auto-Asignación para Repartidores -->
                <div class="center" style="margin-top: 15px; margin-bottom: 15px; border: 1px dashed #000; padding: 8px;">
                    <img src="${qrUrl}" alt="QR Asignar Reparto" style="width: 130px; height: 130px;" />
                    <p style="font-size: 8px; margin: 5px 0 0 0; font-weight: bold; font-family: sans-serif;">ESCANEAR PARA ASIGNAR REPARTO</p>
                </div>
                `}
 
                ${pedido.afip_estado === 'EMITIDA' ? `
                <div class="divider"></div>
                <div class="afip-placeholder center" style="border: 1px solid #000; padding: 8px; margin-top: 15px; font-size: 10px;">
                    <p class="bold" style="margin: 0; font-size: 11px;">COMPROBANTE AUTORIZADO</p>
                    <p style="margin: 5px 0; font-weight: bold; font-size: 11px;">NRO: ${pedido.afip_numero_factura}</p>
                    <p style="margin: 2px 0;">CAE: ${pedido.afip_cae}</p>
                    <p style="margin: 2px 0 8px 0;">VTO CAE: ${new Date(pedido.afip_cae_vto + 'T12:00:00').toLocaleDateString()}</p>
                    <div class="center">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pedido.afip_qr)}" style="width: 110px; height: 110px; display: block; margin: 0 auto;" />
                    </div>
                </div>
                ` : ''}
                <div class="center" style="margin-top: 10px;">¡Gracias por tu compra!</div>
            </body>
            </html>
        `;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Esperar a que se carguen todas las imágenes (como los códigos QR externos) antes de imprimir
        const images = iframeDoc.getElementsByTagName('img');
        let loadedCount = 0;
        const totalImages = images.length;
        let printTriggered = false;

        const wasFullscreen = !!document.fullscreenElement;

        const triggerPrint = () => {
            if (!printTriggered) {
                printTriggered = true;
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                // Intentar volver a pantalla completa automáticamente si estaba activa
                if (wasFullscreen) {
                    setTimeout(() => {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen().catch((err) => {
                                console.log("El navegador bloqueó la reactivación automática de pantalla completa:", err.message);
                            });
                        }
                    }, 500);
                }
            }
        };

        if (totalImages === 0) {
            triggerPrint();
        } else {
            const onImageLoad = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    triggerPrint();
                }
            };

            for (let i = 0; i < totalImages; i++) {
                if (images[i].complete) {
                    onImageLoad();
                } else {
                    images[i].onload = onImageLoad;
                    images[i].onerror = onImageLoad; // Si alguna imagen falla, continuamos para no trabar la impresión
                }
            }

            // Fallback de seguridad: si las imágenes tardan más de 2 segundos en cargar, disparar la impresión de todas formas
            setTimeout(triggerPrint, 2000);
        }
    };

    const handleUpdateStatus = async (id_pedido, nuevoEstado) => {
        try {
            await api.put(`/pedidos/${id_pedido}/estado`, { estado: nuevoEstado });
            alert(`Pedido #${id_pedido} actualizado a: ${nuevoEstado}`);
            fetchData();
        } catch (error) {
            console.error('Error al actualizar el estado del pedido:', error);
            alert('No se pudo actualizar el estado del pedido.');
        }
    };

    const handleRetryInvoice = async (id_pedido) => {
        try {
            await api.post(`/pedidos/${id_pedido}/facturar`);
            alert(`Factura emitida con éxito para el pedido #${id_pedido}`);
            fetchData();
        } catch (error) {
            console.error('Error al reintentar facturación:', error);
            const msg = error.response?.data?.details || error.response?.data?.message || 'Error al emitir la factura.';
            alert(`Error: ${msg}`);
        }
    };

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
                        Gestión de <span className="text-gold-600">Pedidos</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Control total de ventas y despachos</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-200 shadow-sm">
                        <Package size={18} className="text-gold-500" />
                        {filteredOrders.length} {filter === 'Hoy' ? 'hoy' : 'encontrados'}
                    </div>
                    <button 
                        onClick={() => setShowNewOrderModal(true)}
                        className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-8 py-4 rounded-[2rem] font-black shadow-xl shadow-gold-100 transition-all hover:-translate-y-1 active:scale-95"
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
                        <div className="bg-gold-600 p-8 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    <ShoppingCart size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Cargar Nuevo Pedido</h2>
                                    <p className="text-gold-100 text-sm font-bold opacity-80 uppercase tracking-widest">Venta por mostrador / Mesa</p>
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
                                            className="w-full pl-12 p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none font-bold"
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
                                            className="group bg-white border border-gray-100 p-4 rounded-3xl hover:border-gold-500 hover:shadow-lg transition-all text-left flex flex-col gap-3 active:scale-95"
                                        >
                                            {prod.img ? (
                                                <img src={prod.img} className="w-full h-24 object-cover rounded-2xl" alt={prod.nombre} />
                                            ) : (
                                                <div className="w-full h-24 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-300"><Package size={24}/></div>
                                            )}
                                            <div>
                                                <p className="font-black text-gray-800 leading-tight group-hover:text-gold-600 transition-colors uppercase text-sm">{prod.nombre}</p>
                                                <p className="text-gold-600 font-black mt-1">${parseFloat(prod.precio).toLocaleString()}</p>
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
                                                <span className="text-gold-200 font-black">esperando</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {newOrder.items.map(item => (
                                                <div key={item.id_producto} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group animate-in slide-in-from-right-3">
                                                    <div className="flex flex-col flex-1">
                                                        <span className="text-base font-black text-gray-800 uppercase tracking-tighter line-clamp-1">{item.nombre}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="bg-gold-100 text-gold-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">x{item.cantidad}</span>
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
                                        <span className="text-2xl font-black text-gold-600 tracking-tight">${calculateTotal().toLocaleString()}</span>
                                    </div>
                                    <button 
                                        onClick={handleConfirmOrder}
                                        disabled={newOrder.items.length === 0 || isSubmitting}
                                        className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-2 ${
                                            newOrder.items.length === 0 || isSubmitting
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
                                            : 'bg-gold-600 text-white hover:bg-gold-700 shadow-gold-100'
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
                                ? 'bg-gold-600 text-white shadow-xl shadow-gold-100'
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
                         <div className="animate-bounce mb-4 text-gold-500"><ShoppingCart size={40} className="mx-auto" /></div>
                         <p className="font-black uppercase tracking-widest text-sm text-gray-400">Cargando las ventas...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((pedido) => (
                        <div key={pedido.id_pedido} className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 border-t-8 border-t-gold-500">
                            <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Orden de Compra</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-800 tracking-tight">#{pedido.id_pedido}</span>
                                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                                                pedido.estado === 'Aprobado' || pedido.estado === 'Listo para retirar' || pedido.estado === 'Entregado' ? 'bg-green-100 text-green-700' :
                                                pedido.estado === 'Rechazado' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {pedido.estado}
                                            </span>
                                            {pedido.metodo_entrega === 'takeaway' && (
                                                <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                                                    Retiro 🛍️
                                                </span>
                                            )}
                                            {pedido.afip_estado === 'EMITIDA' && (
                                                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700" title={`Factura Nro: ${pedido.afip_numero_factura}`}>
                                                    Factura Emitida 🧾
                                                </span>
                                            )}
                                            {pedido.afip_estado === 'ERROR' && (
                                                <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 cursor-help" title={`Error: ${pedido.afip_error}`}>
                                                    Error Factura ⚠️
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-slate-500 text-[10px] font-black bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                                        <Clock size={12} className="mr-1.5 text-gold-500" /> {new Date(pedido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gold-100 rounded-2xl flex items-center justify-center text-gold-600">
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
                                            <span className="text-gray-600 font-bold"><span className="text-gold-600">x{item.cantidad}</span> {item.producto_nombre}</span>
                                            <span className="text-gray-400 font-bold text-xs">${parseFloat(item.precio_unitario).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center px-2">
                                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Total Cobrado</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">${parseFloat(pedido.total).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50/30 border-t border-gray-100 space-y-2">
                                {pedido.metodo_entrega === 'takeaway' && (
                                    <>
                                        {(pedido.estado === 'Pendiente' || pedido.estado === 'Preparando' || pedido.estado === 'Aprobado') && (
                                            <button 
                                                onClick={() => handleUpdateStatus(pedido.id_pedido, 'Listo para retirar')}
                                                disabled={pedido.estado === 'Pendiente'}
                                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                                                    pedido.estado === 'Pendiente'
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                                                    : 'bg-gold-600 hover:bg-gold-700 text-white active:scale-95 shadow-gold-100'
                                                }`}
                                            >
                                                <Package size={16} /> {pedido.estado === 'Pendiente' ? 'Pendiente de Pago' : 'Listo para retirar'}
                                            </button>
                                        )}
                                        {pedido.estado === 'Listo para retirar' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(pedido.id_pedido, 'Entregado')}
                                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-100"
                                            >
                                                <CheckCircle2 size={16} /> Entregar Pedido
                                            </button>
                                        )}
                                    </>
                                )}

                                {pedido.afip_estado === 'ERROR' && (
                                    <button 
                                        onClick={() => handleRetryInvoice(pedido.id_pedido)}
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-100"
                                    >
                                        <Hash size={16} /> Reintentar Factura ARCA
                                    </button>
                                )}

                                <button 
                                    onClick={() => handlePrintTicket(pedido)}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-100"
                                >
                                    <Printer size={16} /> Imprimir Ticket
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