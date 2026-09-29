import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Store, CheckCircle2, Zap, ChevronDown, Wallet,
    PackageCheck, Receipt, Bike, BarChart3, UserPlus, UtensilsCrossed, Share2
} from 'lucide-react';
import api from '../api/axiosConfig';

const BENEFICIOS = [
    {
        icon: Store,
        color: 'bg-gold-100 text-[#ff5b00]',
        titulo: 'Tu tienda online',
        texto: 'Tus clientes piden desde el celular, con tu logo y tus colores. Sin comisiones por venta.'
    },
    {
        icon: Wallet,
        color: 'bg-blue-50 text-[#083d5a]',
        titulo: 'Cobrá con Mercado Pago',
        texto: 'El cliente paga en la tienda y la plata va directo a tu cuenta.'
    },
    {
        icon: PackageCheck,
        color: 'bg-green-50 text-green-600',
        titulo: 'Controlá tu stock de insumos',
        texto: 'Cada venta descuenta los ingredientes. Te avisamos cuando queda poco.'
    },
    {
        icon: Receipt,
        color: 'bg-gold-100 text-[#ff5b00]',
        titulo: 'Facturas sin vueltas',
        texto: 'Se emiten solas, con ARCA (ex AFIP), apenas se aprueba el cobro.'
    },
    {
        icon: Bike,
        color: 'bg-blue-50 text-[#083d5a]',
        titulo: 'Repartidores ordenados',
        texto: 'Cargá a tus cadetes. Cada uno ve sus entregas en su celular.'
    },
    {
        icon: BarChart3,
        color: 'bg-green-50 text-green-600',
        titulo: 'Mirá cómo te va',
        texto: 'Cuánto vendiste, qué se pide más y a qué hora hay más gente.'
    }
];

// Capturas chicas que se superponen a la imagen base del hero.
const HERO_CAPTURAS = [
    {
        src: '/capturas/hero-ticket.webp',
        alt: 'Ticket de una venta listo para imprimir',
        width: 365, height: 452,
        pos: 'top-[-4%] right-[2%] sm:-right-[2%] w-[22%] sm:w-[19%]',
        rot: '14deg', delay: '0.35s'
    },
    {
        src: '/capturas/hero-editar-producto.webp',
        alt: 'Pantalla para editar el nombre, el precio y la foto de un producto',
        width: 1130, height: 880,
        pos: 'bottom-[-10%] right-[6%] sm:-bottom-[8%] sm:right-[5%] w-[38%] sm:w-[36%]',
        rot: '6deg', delay: '0.5s'
    },
    {
        src: '/capturas/hero-producto-tarjeta.webp',
        alt: 'Producto de la carta tal como lo ve el cliente en la tienda online',
        width: 518, height: 650,
        pos: 'bottom-[-6%] left-[4%] sm:bottom-[2%] sm:left-[3%] w-[26%] sm:w-[24%]',
        rot: '-5deg', delay: '0.65s'
    }
];

const PASOS = [
    { icon: UserPlus, titulo: 'Creá tu cuenta', texto: 'Tarda un par de minutos. Los primeros 10 días son gratis.' },
    { icon: UtensilsCrossed, titulo: 'Cargá tus productos', texto: 'Poné nombre, precio y foto. Después los cambiás cuando quieras.' },
    { icon: Share2, titulo: 'Compartí tu link', texto: 'Pasale el link de tu tienda a tus clientes y empezá a recibir pedidos.' }
];

const CAPTURAS_PANEL = [
    {
        src: '/capturas/panel-resumen.webp',
        width: 1440, height: 709,
        alt: 'Pantalla de resumen del panel con las ventas de hoy y del mes, el ticket promedio y un gráfico de ventas',
        titulo: 'Mirá cómo te va',
        texto: 'Las ventas de hoy y del mes, el ticket promedio y los productos que más se piden.'
    },
    {
        src: '/capturas/panel-pedidos.webp',
        width: 1440, height: 709,
        alt: 'Lista de pedidos del día con su estado: en preparación, en camino o entregado, y el botón para imprimir el ticket',
        titulo: 'Todos tus pedidos en una pantalla',
        texto: 'Mirá cuáles están en preparación, en camino o entregados. Imprimí el ticket con un toque.'
    },
    {
        src: '/capturas/panel-productos.webp',
        width: 1440, height: 709,
        alt: 'Lista de productos del local con categoría y precio, y botones para editar o borrar',
        titulo: 'Tu carta, siempre al día',
        texto: 'Cargá tus productos y cambiá un precio cuando lo necesites.'
    },
    {
        src: '/capturas/panel-insumos.webp',
        width: 1515, height: 625,
        alt: 'Pantalla de insumos con el stock actual de cada ingrediente, el mínimo y un aviso de estado',
        titulo: 'Controlá tu stock de insumos',
        texto: 'Mirá cuánto te queda de cada ingrediente y cuándo tenés que reponer.'
    },
    {
        src: '/capturas/panel-configuracion.webp',
        width: 1473, height: 741,
        alt: 'Pantalla de configuración con el nombre del local, el logo, los colores, las redes y los datos de Mercado Pago',
        titulo: 'Tu local, a tu manera',
        texto: 'Poné tu nombre, tu logo y tus colores, y cargá tus datos de contacto y de cobro.'
    }
];

const CAPTURAS_CELULAR = [
    {
        src: '/capturas/tienda-checkout.webp',
        alt: 'Tienda online vista en el celular: el cliente elige entre envío a domicilio o retiro por el local',
        titulo: 'Así pide tu cliente',
        texto: 'Elige si quiere que se lo lleves o si pasa a retirarlo, y completa sus datos.'
    },
    {
        src: '/capturas/tienda-mis-pedidos.webp',
        alt: 'Pantalla de Mis pedidos en el celular del cliente, con el estado de cada pedido',
        titulo: 'Tu cliente sigue su pedido',
        texto: 'Ve si está en preparación, en camino o entregado, sin llamarte.'
    },
    {
        src: '/capturas/reparto-celular.webp',
        alt: 'Pantalla del repartidor en el celular con el pedido a entregar y los botones para abrir el mapa y llamar al cliente',
        titulo: 'Tu repartidor, con todo a mano',
        texto: 'Ve a dónde ir, abre el mapa y llama al cliente desde su celular.'
    }
];

const PREGUNTAS = [
    {
        p: '¿Cobran comisión por cada venta?',
        r: 'No. Pagás solo el plan mensual, vendas lo que vendas. Mercado Pago cobra su propia tarifa por procesar cada pago.'
    },
    {
        p: '¿Puedo probarlo gratis?',
        r: 'Sí, 10 días con todo incluido. Hoy no pagás nada. Si no cancelás antes del día 10, se te cobra el plan. Cancelás online cuando quieras.'
    },
    {
        p: '¿Tengo que saber de computación?',
        r: 'No. Cargás tus productos y listo. Dentro del panel hay guías paso a paso, y si te trabás tenés soporte prioritario.'
    },
    {
        p: '¿Mis clientes tienen que bajarse una app?',
        r: 'No. Piden desde el navegador del celular, con el link de tu tienda.'
    },
    {
        p: '¿Cómo hago las facturas?',
        r: 'Cargás tus datos de ARCA (ex AFIP) una sola vez. Después las facturas se emiten solas cuando se aprueba el cobro. En el panel tenés la guía para hacerlo.'
    }
];

const botonPrincipal = 'bg-[#ff5b00] hover:bg-[#ef4c00] text-white font-black text-lg rounded-full min-h-[52px] px-8 py-3 inline-flex items-center justify-center gap-3 shadow-lg shadow-gold-200 transition-all active:scale-95';

const Landing = () => {
    const [prices, setPrices] = useState({ monthly: 60000, annual: 612000 });

    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                const response = await api.get('/subscriptions/planes');
                const monthlyPlan = response.data.find(p => p.id_plan === 'PRO_MONTHLY');
                const annualPlan = response.data.find(p => p.id_plan === 'PRO_ANNUAL');

                setPrices({
                    monthly: monthlyPlan ? parseFloat(monthlyPlan.precio) : 60000,
                    annual: annualPlan ? parseFloat(annualPlan.precio) : 612000
                });
            } catch (error) {
                console.error('Error fetching planes for landing:', error);
            }
        };
        fetchPlanes();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-gold-200 overflow-x-hidden">
            {/* Barra superior */}
            <nav className="flex items-center justify-between gap-3 px-4 py-4 sm:p-6 max-w-7xl mx-auto">
                <img src="/logo-acommerr.png" alt="Acommerr" className="h-10 sm:h-12 object-contain" />
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link to="/login" className="font-bold text-[#305a83] hover:text-[#ff5b00] transition-colors min-h-[44px] px-3 inline-flex items-center">
                        Ingresar
                    </Link>
                    <Link to="/register" className="bg-[#ff5b00] hover:bg-[#ef4c00] text-white px-4 sm:px-6 min-h-[44px] rounded-full font-bold shadow-lg shadow-gold-200 transition-all active:scale-95 inline-flex items-center">
                        Probalo gratis
                    </Link>
                </div>
            </nav>

            <main>
                {/* Hero */}
                <section className="relative pt-10 sm:pt-16 pb-16 overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 pointer-events-none">
                        <div className="w-[600px] h-[600px] bg-[#ff5b00]/10 rounded-full blur-3xl" />
                    </div>
                    <div className="absolute top-40 left-0 -translate-x-1/3 pointer-events-none">
                        <div className="w-[500px] h-[500px] bg-[#083d5a]/10 rounded-full blur-3xl" />
                    </div>

                    <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#25323f] tracking-tight mb-6 leading-tight">
                            Todo tu local en <span className="text-[#ff5b00]">un solo lugar</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-[#305a83] mb-6 max-w-2xl mx-auto font-medium">
                            Recibí pedidos por internet, controlá tu stock, cobrá y facturá. Desde el celular o la compu.
                        </p>

                        <p className="text-base sm:text-lg text-[#25323f] font-bold mb-5 max-w-xl mx-auto leading-snug">
                            ¿Tenés un bar, hamburguesería, pizzería, rotisería...?{' '}
                            <span className="text-[#ff5b00]">Acommerr es la solución para tu negocio.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className={`w-full sm:w-auto ${botonPrincipal}`}>
                                Probalo 10 días gratis <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-[#ff5b00] hover:text-[#ff5b00] min-h-[52px] px-8 py-3 rounded-full font-black text-lg text-gray-600 transition-all inline-flex items-center justify-center">
                                Ya tengo cuenta
                            </Link>
                        </div>

                        <div className="relative mt-12 mb-8 sm:mb-12">
                            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-2xl shadow-[#083d5a]/20 bg-white">
                                <img
                                    src="/capturas/panel-resumen.webp"
                                    alt="Pantalla de resumen del panel de Acommerr con las ventas de hoy y del mes, el ticket promedio y un gráfico de ventas"
                                    width="1440"
                                    height="709"
                                    fetchPriority="high"
                                    decoding="async"
                                    className="w-full h-auto block"
                                />
                            </div>
                            {HERO_CAPTURAS.map(({ src, alt, width, height, pos, rot, delay }) => (
                                <div
                                    key={src}
                                    className={`hero-pop absolute ${pos} rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-2xl shadow-[#083d5a]/30`}
                                    style={{ '--hero-rot': rot, animationDelay: delay }}
                                >
                                    <img
                                        src={src}
                                        alt={alt}
                                        width={width}
                                        height={height}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-auto block"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Qué resolvés */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#25323f] text-center mb-3">Lo que te resuelve todos los días</h2>
                    <p className="text-lg text-[#305a83] text-center font-medium mb-12 max-w-2xl mx-auto">Menos papelitos y menos llamados. Más tiempo para atender tu local.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BENEFICIOS.map(({ icon, color, titulo, texto }) => {
                            const Icon = icon;
                            return (
                            <div key={titulo} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                                    <Icon size={28} aria-hidden="true" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-[#25323f] mb-2">{titulo}</h3>
                                <p className="text-base sm:text-lg text-[#305a83] font-medium leading-relaxed">{texto}</p>
                            </div>
                            );
                        })}
                    </div>
                </section>

                {/* Cómo funciona */}
                <section className="bg-white py-16">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <h2 className="text-3xl sm:text-4xl font-black text-[#25323f] text-center mb-12">Empezar es fácil</h2>
                        <ol className="grid md:grid-cols-3 gap-8">
                            {PASOS.map(({ icon, titulo, texto }, i) => {
                                const Icon = icon;
                                return (
                                <li key={titulo} className="text-center">
                                    <div className="relative w-16 h-16 mx-auto mb-4 bg-[#083d5a] text-white rounded-full flex items-center justify-center">
                                        <Icon size={28} aria-hidden="true" />
                                        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#ff5b00] text-white text-sm font-black flex items-center justify-center">{i + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-[#25323f] mb-2">{titulo}</h3>
                                    <p className="text-base sm:text-lg text-[#305a83] font-medium">{texto}</p>
                                </li>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* Capturas del panel */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#25323f] text-center mb-3">Mirá cómo se usa</h2>
                    <p className="text-lg text-[#305a83] text-center font-medium mb-12 max-w-2xl mx-auto">Estas son pantallas reales de Acommerr.</p>

                    <div className="grid lg:grid-cols-2 gap-8 mb-16">
                        {CAPTURAS_PANEL.map(({ src, alt, width, height, titulo, texto }, i) => (
                            <figure key={src} className={i === 0 ? 'lg:col-span-2' : ''}>
                                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-200/60 bg-white">
                                    <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="w-full h-auto block" />
                                </div>
                                <figcaption className="mt-4 px-1">
                                    <h3 className="text-xl font-black text-[#25323f]">{titulo}</h3>
                                    <p className="text-base sm:text-lg text-[#305a83] font-medium">{texto}</p>
                                </figcaption>
                            </figure>
                        ))}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#25323f] text-center mb-10">Y en el celular de tus clientes y repartidores</h3>
                    <div className="grid sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
                        {CAPTURAS_CELULAR.map(({ src, alt, titulo, texto }) => (
                            <figure key={src} className="max-w-[260px] mx-auto sm:max-w-none">
                                <div className="rounded-[1.75rem] overflow-hidden border-4 border-[#25323f] shadow-xl shadow-gray-300/60 bg-white">
                                    <img src={src} alt={alt} width="720" height="1300" loading="lazy" decoding="async" className="w-full h-auto block" />
                                </div>
                                <figcaption className="mt-4 text-center">
                                    <h4 className="text-lg font-black text-[#25323f]">{titulo}</h4>
                                    <p className="text-base text-[#305a83] font-medium">{texto}</p>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                {/* Precio */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#25323f] mb-3">Un solo plan, con todo incluido</h2>
                    <p className="text-lg text-[#305a83] mb-12 font-medium">Sin comisiones por venta.</p>

                    <div className="bg-[#25323f] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 max-w-md mx-auto relative overflow-hidden shadow-2xl text-left">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none">
                            <Store size={120} aria-hidden="true" />
                        </div>
                        <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                            <span className="bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">10 días gratis</span>
                            <span className="bg-[#ff5b00] text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Todo incluido</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2 relative z-10">
                            <span className="text-4xl sm:text-5xl font-black text-white">${prices.monthly.toLocaleString('es-AR')}</span>
                            <span className="text-gray-300 font-bold">por mes</span>
                        </div>
                        <p className="text-sm font-bold text-gold-300 mb-6 relative z-10">Pagando por año ahorrás 15%: ${prices.annual.toLocaleString('es-AR')}</p>

                        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3 relative z-10">
                            <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                                <Zap size={12} strokeWidth={3} className="fill-emerald-400" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-emerald-400">Probalo 10 días gratis</h3>
                                <p className="text-sm text-gray-300 font-medium mt-0.5">Hoy no pagás nada. Si no cancelás antes del día 10, se cobra el plan.</p>
                            </div>
                        </div>

                        <ul className="space-y-4 relative z-10 mb-8">
                            {[
                                'Tu tienda online y el panel para manejar tu local',
                                'Stock y recetas: cada venta descuenta ingredientes',
                                'Facturas electrónicas de ARCA (ex AFIP)',
                                'Soporte prioritario'
                            ].map(item => (
                                <li key={item} className="flex items-start gap-3 font-bold text-white">
                                    <CheckCircle2 className="text-[#ff5b00] shrink-0 mt-0.5" size={22} aria-hidden="true" /> {item}
                                </li>
                            ))}
                        </ul>

                        <Link to="/register" className="w-full bg-[#ff5b00] hover:bg-[#ef4c00] text-white min-h-[56px] rounded-2xl font-black text-lg flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-[#ff5b00]/20 relative z-10">
                            Probalo gratis
                        </Link>
                        <p className="text-xs text-gray-300 text-center mt-3 font-bold relative z-10">Cancelás online cuando quieras.</p>
                    </div>
                </section>

                {/* Preguntas frecuentes */}
                <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#25323f] text-center mb-10">Preguntas que nos hacen</h2>
                    <div className="space-y-3">
                        {PREGUNTAS.map(({ p, r }) => (
                            <details key={p} className="group bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none min-h-[56px] px-5 py-4 font-black text-lg text-[#25323f]">
                                    {p}
                                    <ChevronDown className="shrink-0 text-[#ff5b00] transition-transform group-open:rotate-180" size={22} aria-hidden="true" />
                                </summary>
                                <p className="px-5 pb-5 text-base sm:text-lg text-[#305a83] font-medium leading-relaxed">{r}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Cierre */}
                <section className="bg-[#083d5a] py-16 px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Probalo en tu local</h2>
                    <p className="text-lg text-gray-200 font-medium mb-8">10 días gratis, con todo incluido.</p>
                    <Link to="/register" className={botonPrincipal}>
                        Crear mi cuenta <ArrowRight size={20} />
                    </Link>
                </section>
            </main>

            <footer className="border-t border-gray-100 py-8 px-4 text-center">
                <p className="text-sm font-bold text-gray-500">© 2026 Acommerr</p>
            </footer>
        </div>
    );
};

export default Landing;
