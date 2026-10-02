import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Store, Check, Zap, Plus, Wallet, PackageCheck, Receipt, Bike,
    BarChart3, Minus, UserPlus, UtensilsCrossed, Share2, Smartphone, ShieldCheck, BadgePercent
} from 'lucide-react';
import api from '../api/axiosConfig';

const RUBROS = ['Pizzerías', 'Hamburgueserías', 'Bares', 'Rotiserías', 'Sushi', 'Parrillas', 'Cafés', 'Heladerías', 'Panaderías', 'Food trucks'];

const NAV_LINKS = [
    { href: '#funciones', label: 'Funciones' },
    { href: '#como-funciona', label: 'Cómo funciona' },
    { href: '#precio', label: 'Precio' },
    { href: '#preguntas', label: 'Preguntas' }
];

// Capturas chicas que se superponen a la imagen base del hero.
const HERO_CAPTURAS = [
    {
        src: '/capturas/hero-ticket.webp',
        alt: 'Ticket de una venta listo para imprimir',
        width: 365, height: 452,
        pos: 'top-[-6%] right-[1%] sm:-right-[3%] w-[22%] sm:w-[17%]',
        rot: '8deg', delay: '0.35s', float: '0s'
    },
    {
        src: '/capturas/hero-editar-producto.webp',
        alt: 'Pantalla para editar el nombre, el precio y la foto de un producto',
        width: 1130, height: 880,
        pos: 'bottom-[-12%] right-[4%] sm:-bottom-[10%] sm:right-[6%] w-[40%] sm:w-[34%]',
        rot: '-3deg', delay: '0.5s', float: '1.2s'
    },
    {
        src: '/capturas/hero-producto-tarjeta.webp',
        alt: 'Producto de la carta tal como lo ve el cliente en la tienda online',
        width: 518, height: 650,
        pos: 'bottom-[-8%] left-[2%] sm:bottom-[4%] sm:-left-[3%] w-[26%] sm:w-[20%]',
        rot: '-6deg', delay: '0.65s', float: '2.4s'
    }
];

const PASOS = [
    { icon: UserPlus, titulo: 'Creá tu cuenta', texto: 'Tarda un par de minutos. Los primeros 10 días son gratis.' },
    { icon: UtensilsCrossed, titulo: 'Cargá tus productos', texto: 'Poné nombre, precio y foto. Después los cambiás cuando quieras.' },
    { icon: Share2, titulo: 'Compartí tu link', texto: 'Pasale el link de tu tienda a tus clientes y empezá a recibir pedidos.' }
];

const CAPTURAS_PANEL = [
    {
        tab: 'Resumen',
        src: '/capturas/panel-resumen.webp',
        width: 1440, height: 709,
        alt: 'Pantalla de resumen del panel con las ventas de hoy y del mes, el ticket promedio y un gráfico de ventas',
        titulo: 'Mirá cómo te va',
        texto: 'Las ventas de hoy y del mes, el ticket promedio y los productos que más se piden.'
    },
    {
        tab: 'Pedidos',
        src: '/capturas/panel-pedidos.webp',
        width: 1440, height: 709,
        alt: 'Lista de pedidos del día con su estado: en preparación, en camino o entregado, y el botón para imprimir el ticket',
        titulo: 'Todos tus pedidos en una pantalla',
        texto: 'Mirá cuáles están en preparación, en camino o entregados. Imprimí el ticket con un toque.'
    },
    {
        tab: 'Productos',
        src: '/capturas/panel-productos.webp',
        width: 1440, height: 709,
        alt: 'Lista de productos del local con categoría y precio, y botones para editar o borrar',
        titulo: 'Tu carta, siempre al día',
        texto: 'Cargá tus productos y cambiá un precio cuando lo necesites.'
    },
    {
        tab: 'Insumos',
        src: '/capturas/panel-insumos.webp',
        width: 1515, height: 625,
        alt: 'Pantalla de insumos con el stock actual de cada ingrediente, el mínimo y un aviso de estado',
        titulo: 'Controlá tu stock de insumos',
        texto: 'Mirá cuánto te queda de cada ingrediente y cuándo tenés que reponer.'
    },
    {
        tab: 'Configuración',
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
        r: 'No. Pagás solo tu plan (Clásica o Premium), vendas lo que vendas. Mercado Pago cobra su propia tarifa por procesar cada pago.'
    },
    {
        p: '¿Puedo probarlo gratis?',
        r: 'Sí, 10 días gratis, con cualquiera de los dos planes. Hoy no pagás nada. Si no cancelás antes del día 10, se te cobra el plan. Cancelás online cuando quieras.'
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
        r: 'Cargás tus datos de ARCA (ex AFIP) una sola vez. Con el plan Premium, después las facturas se emiten solas cuando se aprueba el cobro. En el panel tenés la guía para hacerlo.'
    }
];

const INCLUYE_BASE = [
    'Tu tienda online con tu logo y tus colores',
    'Stock y recetas: cada venta descuenta ingredientes',
    'Pedidos y clientes sin límite',
    'Panel con estadísticas de tus ventas'
];

const PLANES = [
    {
        id: 'clasica',
        nombre: 'Clásica',
        resumen: 'Todo para vender online y manejar tu local, sin facturación automática.',
        incluye: INCLUYE_BASE,
        noIncluye: 'Facturación automática con ARCA'
    },
    {
        id: 'premium',
        nombre: 'Premium',
        resumen: 'El sistema completo, con las facturas saliendo solas en cada venta.',
        incluye: [
            ...INCLUYE_BASE,
            'Facturas electrónicas de ARCA (ex AFIP) automáticas',
            'Ticket en PDF para descargar',
            'Soporte prioritario'
        ]
    }
];

const botonPrincipal = 'group bg-[#ff5b00] hover:bg-[#ef4c00] text-white font-extrabold text-base sm:text-lg rounded-full min-h-[56px] px-8 py-3 inline-flex items-center justify-center gap-3 shadow-xl shadow-[#ff5b00]/30 transition-[transform,background-color] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff5b00]';
const botonSecundario = 'bg-white ring-1 ring-[#083d5a]/15 hover:ring-[#ff5b00] hover:text-[#ff5b00] min-h-[56px] px-8 py-3 rounded-full font-extrabold text-base sm:text-lg text-[#083d5a] transition-[transform,box-shadow,color] duration-200 active:scale-[0.97] inline-flex items-center justify-center';

// Muestra el contenido con una entrada suave cuando entra en pantalla.
const Reveal = ({ children, delay = 0, className = '', as = 'div' }) => {
    const Tag = as;
    const ref = useRef(null);
    const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined');

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
            style={{ '--reveal-delay': `${delay}ms` }}
        >
            {children}
        </Tag>
    );
};

const DEMO_URL = 'https://acommerr.store/prueba1';

// Celular de la portada: al tocar "Probar demo" carga la tienda de prueba adentro.
const DemoPhone = () => {
    const [abierta, setAbierta] = useState(false);
    const [cargada, setCargada] = useState(false);

    return (
        <div className="relative w-[300px] sm:w-[340px] shrink-0">
            <div aria-hidden="true" className="absolute -inset-6 rounded-full bg-[#ff5b00]/20 blur-3xl" />
            <div className="relative rounded-[2.8rem] bg-[#25323f] p-[10px] shadow-2xl shadow-[#083d5a]/40 ring-1 ring-white/10">
                <div className="relative h-[570px] sm:h-[640px] rounded-[2.2rem] overflow-hidden bg-[#083d5a]">
                    <div aria-hidden="true" className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-[#25323f] z-20" />

                    {abierta ? (
                        <>
                            {!cargada && (
                                <p role="status" className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/80">Cargando la tienda…</p>
                            )}
                            <iframe
                                src={DEMO_URL}
                                title="Demo de la tienda de Acommerr"
                                onLoad={() => setCargada(true)}
                                loading="lazy"
                                className={`absolute top-0 left-0 w-[375px] h-[763px] sm:h-[750px] origin-top-left scale-[0.7467] sm:scale-[0.8533] border-0 bg-white pt-8 transition-opacity duration-300 ${cargada ? "opacity-100" : "opacity-0"}`}
                            />
                            <button
                                type="button"
                                onClick={() => { setAbierta(false); setCargada(false); }}
                                className="absolute top-1 left-3 z-30 text-[11px] font-extrabold text-[#083d5a] bg-white/90 rounded-full px-2.5 py-1 min-h-[24px] shadow-sm active:scale-95 transition-transform"
                            >
                                ← Volver
                            </button>
                        </>
                    ) : (
                        <div className="relative h-full flex flex-col items-center justify-center text-center px-7 text-white landing-grain">
                            <div aria-hidden="true" className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#ff5b00]/40 blur-3xl" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-3xl bg-[#ff5b00] flex items-center justify-center mb-6 shadow-lg shadow-[#ff5b00]/40">
                                    <Store size={30} aria-hidden="true" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAbierta(true)}
                                    className="group bg-white text-[#083d5a] hover:bg-[#fff4ed] font-extrabold text-lg rounded-full min-h-[52px] px-8 inline-flex items-center gap-2 shadow-xl transition-[transform,background-color] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                >
                                    Probar demo
                                    <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                                </button>
                                <span className="mt-4 text-sm font-extrabold uppercase tracking-[0.18em] text-[#ffaa66]">Tienda</span>
                                <p className="mt-6 text-sm text-white/70 font-medium leading-relaxed">Así la ve tu cliente en su celular. Tocá y pedí algo.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Etiqueta =({ children }) => (
    <span className="inline-block text-xs font-extrabold uppercase tracking-[0.14em] text-[#ff5b00] mb-4">{children}</span>
);

const Landing = () => {
    const [prices, setPrices] = useState({
        clasica: { mensual: 30000, anual: 306000 },
        premium: { mensual: 40000, anual: 408000 }
    });
    const [anual, setAnual] = useState(false);
    const [tab, setTab] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                const response = await api.get('/subscriptions/planes');
                const precio = (id, fallback) => {
                    const plan = response.data.find(p => p.id_plan === id);
                    return plan ? parseFloat(plan.precio) : fallback;
                };
                setPrices({
                    clasica: { mensual: precio('CLASICA_MONTHLY', 30000), anual: precio('CLASICA_ANNUAL', 306000) },
                    premium: { mensual: precio('PREMIUM_MONTHLY', 40000), anual: precio('PREMIUM_ANNUAL', 408000) }
                });
            } catch (error) {
                console.error('Error fetching planes for landing:', error);
            }
        };
        fetchPlanes();
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const panel = CAPTURAS_PANEL[tab];

    return (
        <div className="landing min-h-screen bg-[#fbf8f4] text-[#25323f] selection:bg-[#ffcba3] overflow-x-hidden">
            <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded-full focus:font-bold">
                Saltar al contenido
            </a>

            {/* Barra superior flotante */}
            <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
                <nav
                    aria-label="Principal"
                    className={`pointer-events-auto max-w-6xl mx-auto flex items-center justify-between gap-3 rounded-full pl-5 pr-2 py-2 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-xl shadow-lg shadow-[#083d5a]/10 ring-1 ring-[#083d5a]/5' : 'bg-transparent'}`}
                >
                    <a href="#inicio" aria-label="Acommerr, ir al inicio">
                        <img src="/logo-acommerr.png" alt="Acommerr" className="h-8 sm:h-10 object-contain" />
                    </a>
                    <ul className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ href, label }) => (
                            <li key={href}>
                                <a href={href} className="px-4 py-2 rounded-full text-sm font-bold text-[#305a83] hover:text-[#ff5b00] hover:bg-[#ff5b00]/5 transition-colors">
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link to="/login" className="font-bold text-sm text-[#083d5a] hover:text-[#ff5b00] transition-colors min-h-[44px] px-3 inline-flex items-center">
                            Ingresar
                        </Link>
                        <Link to="/register" className="bg-[#ff5b00] hover:bg-[#ef4c00] text-white text-sm px-4 sm:px-6 min-h-[44px] rounded-full font-extrabold transition-[transform,background-color] duration-200 active:scale-[0.97] inline-flex items-center">
                            Probalo gratis
                        </Link>
                    </div>
                </nav>
            </header>

            <main id="contenido">
                {/* Hero */}
                <section id="inicio" className="relative pt-32 sm:pt-40 pb-20 sm:pb-28">
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full bg-[#ff5b00]/12 blur-3xl" />
                        <div className="absolute top-1/3 -left-56 w-[520px] h-[520px] rounded-full bg-[#083d5a]/10 blur-3xl" />
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-14 lg:gap-8 items-center">
                        <div>
                            <Reveal>
                                <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-[#ff5b00]/20 pl-2 pr-4 py-1.5 text-sm font-bold text-[#083d5a] shadow-sm mb-7">
                                    <span className="bg-[#ff5b00] text-white rounded-full px-2.5 py-0.5 text-xs font-extrabold">Nuevo</span>
                                    10 días gratis para probarlo
                                </span>
                            </Reveal>
                            <Reveal delay={60}>
                                <h1 className="text-[2.6rem] leading-[1.02] sm:text-6xl xl:text-7xl font-extrabold text-[#083d5a] mb-6">
                                    Todo tu local en <span className="text-[#ff5b00]">un solo lugar</span>
                                </h1>
                            </Reveal>
                            <Reveal delay={120}>
                                <p className="text-lg sm:text-xl text-[#305a83] mb-3 max-w-xl font-medium leading-relaxed">
                                    Recibí pedidos por internet, controlá tu stock, cobrá y facturá. Desde el celular o la compu.
                                </p>
                                <p className="text-base sm:text-lg text-[#25323f] font-bold mb-9 max-w-xl leading-snug">
                                    ¿Tenés un bar, hamburguesería, pizzería, rotisería...?{' '}
                                    <span className="text-[#ff5b00]">Acommerr es la solución para tu negocio.</span>
                                </p>
                            </Reveal>
                            <Reveal delay={180}>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                    <Link to="/register" className={botonPrincipal}>
                                        Probalo 10 días gratis
                                        <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                                    </Link>
                                    <Link to="/login" className={botonSecundario}>
                                        Ya tengo cuenta
                                    </Link>
                                </div>
                                <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-[#305a83]">
                                    {['Sin comisiones por venta', 'Cobrás con Mercado Pago', 'Facturas con ARCA'].map(t => (
                                        <li key={t} className="inline-flex items-center gap-2">
                                            <Check size={16} strokeWidth={3} className="text-emerald-600" aria-hidden="true" /> {t}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        </div>
                        <Reveal delay={200} className="flex justify-center lg:justify-end"><DemoPhone /></Reveal>
                        </div>

                        <Reveal delay={240} className="relative mt-16 sm:mt-20">
                            <div className="rounded-[1.25rem] sm:rounded-[2rem] p-2 sm:p-3 bg-gradient-to-b from-white to-[#083d5a]/5 ring-1 ring-[#083d5a]/10 shadow-2xl shadow-[#083d5a]/20">
                                <div className="rounded-[0.9rem] sm:rounded-[1.5rem] overflow-hidden bg-white ring-1 ring-[#083d5a]/10">
                                    <div className="flex items-center gap-1.5 px-4 py-3 bg-[#f4f1ec] border-b border-[#083d5a]/5" aria-hidden="true">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5b00]/70" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#083d5a]/25" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#083d5a]/15" />
                                    </div>
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
                            </div>
                            {HERO_CAPTURAS.map(({ src, alt, width, height, pos, rot, delay, float }) => (
                                <div
                                    key={src}
                                    className={`hero-pop absolute ${pos}`}
                                    style={{ '--hero-rot': rot, animationDelay: delay }}
                                >
                                    <div
                                        className="landing-float rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-[#083d5a]/10 bg-white shadow-2xl shadow-[#083d5a]/30"
                                        style={{ '--float-delay': float }}
                                    >
                                        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="w-full h-auto block" />
                                    </div>
                                </div>
                            ))}
                        </Reveal>
                    </div>
                </section>

                {/* Cinta de rubros */}
                <section aria-label="Para qué tipo de negocio sirve" className="py-8 border-y border-[#083d5a]/8 bg-white/60">
                    <p className="text-center text-sm font-bold text-[#305a83] mb-5 px-4">Pensado para locales gastronómicos como el tuyo</p>
                    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                        <ul className="landing-marquee flex w-max gap-3">
                            {[...RUBROS, ...RUBROS].map((r, i) => (
                                <li key={`${r}-${i}`} aria-hidden={i >= RUBROS.length} className="shrink-0 rounded-full bg-white ring-1 ring-[#083d5a]/10 px-5 py-2.5 text-sm sm:text-base font-bold text-[#083d5a]">
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Qué resolvés: bento */}
                <section id="funciones" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
                    <Reveal className="max-w-2xl mb-12 sm:mb-16">
                        <Etiqueta>Funciones</Etiqueta>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#083d5a] mb-4 leading-[1.05]">Lo que te resuelve todos los días</h2>
                        <p className="text-lg text-[#305a83] font-medium">Menos papelitos y menos llamados. Más tiempo para atender tu local.</p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
                        {/* Tienda online */}
                        <Reveal className="md:col-span-4 md:row-span-2 relative overflow-hidden rounded-[2rem] bg-[#083d5a] text-white p-7 sm:p-10 landing-grain min-h-[380px]">
                            <div className="relative z-10 max-w-sm">
                                <div className="w-12 h-12 rounded-2xl bg-[#ff5b00] flex items-center justify-center mb-6">
                                    <Store size={24} aria-hidden="true" />
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight">Tu tienda online</h3>
                                <p className="text-base sm:text-lg text-white/80 font-medium leading-relaxed">Tus clientes piden desde el celular, con tu logo y tus colores. Sin comisiones por venta.</p>
                            </div>
                            <div className="hidden sm:block absolute -right-2 -bottom-16 w-[250px] lg:w-[290px] rotate-[6deg] rounded-[1.75rem] overflow-hidden border-[6px] border-[#25323f] shadow-2xl shadow-black/40">
                                <img src="/capturas/tienda-checkout.webp" alt="" width="720" height="1300" loading="lazy" decoding="async" className="w-full h-auto block" />
                            </div>
                        </Reveal>

                        <Reveal delay={80} className="md:col-span-2 rounded-[2rem] bg-white ring-1 ring-[#083d5a]/8 p-7">
                            <div className="w-11 h-11 rounded-2xl bg-[#009ee3]/10 text-[#0078b4] flex items-center justify-center mb-5">
                                <Wallet size={22} aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-extrabold mb-2">Cobrá con Mercado Pago</h3>
                            <p className="text-base text-[#305a83] font-medium leading-relaxed">El cliente paga en la tienda y la plata va directo a tu cuenta.</p>
                        </Reveal>

                        <Reveal delay={140} className="md:col-span-2 rounded-[2rem] bg-[#ff5b00] text-white p-7">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                                <Receipt size={22} aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-extrabold mb-2">Facturas sin vueltas</h3>
                            <p className="text-base text-white/90 font-medium leading-relaxed">Se emiten solas, con ARCA (ex AFIP), apenas se aprueba el cobro.</p>
                        </Reveal>

                        <Reveal delay={60} className="md:col-span-3 rounded-[2rem] bg-white ring-1 ring-[#083d5a]/8 p-7 sm:p-8 flex gap-5 items-start">
                            <div className="shrink-0 w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <PackageCheck size={22} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold mb-2">Controlá tu stock de insumos</h3>
                                <p className="text-base text-[#305a83] font-medium leading-relaxed">Cada venta descuenta los ingredientes. Te avisamos cuando queda poco.</p>
                            </div>
                        </Reveal>

                        <Reveal delay={120} className="md:col-span-3 rounded-[2rem] bg-white ring-1 ring-[#083d5a]/8 p-7 sm:p-8 flex gap-5 items-start">
                            <div className="shrink-0 w-11 h-11 rounded-2xl bg-[#083d5a]/8 text-[#083d5a] flex items-center justify-center">
                                <Bike size={22} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold mb-2">Repartidores ordenados</h3>
                                <p className="text-base text-[#305a83] font-medium leading-relaxed">Cargá a tus cadetes. Cada uno ve sus entregas en su celular.</p>
                            </div>
                        </Reveal>

                        <Reveal delay={60} className="md:col-span-6 rounded-[2rem] bg-gradient-to-br from-white to-[#ffe6d4]/60 ring-1 ring-[#ff5b00]/15 p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                            <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#ff5b00]/10 text-[#ff5b00] flex items-center justify-center">
                                <BarChart3 size={24} aria-hidden="true" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl sm:text-2xl font-extrabold mb-1">Mirá cómo te va</h3>
                                <p className="text-base sm:text-lg text-[#305a83] font-medium">Cuánto vendiste, qué se pide más y a qué hora hay más gente.</p>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Cómo funciona */}
                <section id="como-funciona" className="bg-[#083d5a] text-white py-20 sm:py-28 relative overflow-hidden landing-grain">
                    <div aria-hidden="true" className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-[#ff5b00]/20 blur-3xl pointer-events-none" />
                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                        <Reveal className="max-w-2xl mb-14">
                            <Etiqueta>Cómo funciona</Etiqueta>
                            <h2 className="text-3xl sm:text-5xl font-extrabold leading-[1.05]">Empezar es fácil</h2>
                        </Reveal>
                        <ol className="grid md:grid-cols-3 gap-5 sm:gap-6">
                            {PASOS.map(({ icon, titulo, texto }, i) => {
                                const Icon = icon;
                                return (
                                    <Reveal as="li" key={titulo} delay={i * 90} className="relative rounded-[2rem] bg-white/[0.06] ring-1 ring-white/10 p-7 sm:p-8 overflow-hidden">
                                        <span aria-hidden="true" className="absolute -top-4 right-4 text-[7rem] leading-none font-extrabold text-white/[0.06]">{i + 1}</span>
                                        <div className="relative w-12 h-12 rounded-2xl bg-[#ff5b00] flex items-center justify-center mb-6">
                                            <Icon size={24} aria-hidden="true" />
                                        </div>
                                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffaa66] mb-2">Paso {i + 1}</p>
                                        <h3 className="text-xl sm:text-2xl font-extrabold mb-2">{titulo}</h3>
                                        <p className="text-base sm:text-lg text-white/75 font-medium leading-relaxed">{texto}</p>
                                    </Reveal>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* Recorrido por el panel */}
                <section id="panel" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
                    <Reveal className="max-w-2xl mb-10">
                        <Etiqueta>El panel</Etiqueta>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#083d5a] mb-4 leading-[1.05]">Mirá cómo se usa</h2>
                        <p className="text-lg text-[#305a83] font-medium">Estas son pantallas reales de Acommerr.</p>
                    </Reveal>

                    <div role="tablist" aria-label="Pantallas del panel" className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
                        {CAPTURAS_PANEL.map(({ tab: nombre }, i) => (
                            <button
                                key={nombre}
                                role="tab"
                                type="button"
                                id={`tab-${i}`}
                                aria-selected={tab === i}
                                aria-controls="panel-captura"
                                onClick={() => setTab(i)}
                                className={`shrink-0 min-h-[44px] px-5 rounded-full font-bold text-sm sm:text-base transition-[background-color,color,transform] duration-200 active:scale-[0.97] ${tab === i ? 'bg-[#083d5a] text-white' : 'bg-white ring-1 ring-[#083d5a]/10 text-[#305a83] hover:text-[#ff5b00]'}`}
                            >
                                {nombre}
                            </button>
                        ))}
                    </div>

                    <div id="panel-captura" role="tabpanel" aria-labelledby={`tab-${tab}`} className="grid lg:grid-cols-[1fr_2.2fr] gap-6 lg:gap-10 items-start">
                        <div className="lg:pt-6">
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#083d5a] mb-3">{panel.titulo}</h3>
                            <p className="text-base sm:text-lg text-[#305a83] font-medium leading-relaxed">{panel.texto}</p>
                        </div>
                        <div className="rounded-[1.25rem] sm:rounded-[2rem] p-2 sm:p-3 bg-gradient-to-b from-white to-[#083d5a]/5 ring-1 ring-[#083d5a]/10 shadow-2xl shadow-[#083d5a]/15">
                            <div className="rounded-[0.9rem] sm:rounded-[1.5rem] overflow-hidden bg-white ring-1 ring-[#083d5a]/10">
                                <img
                                    key={panel.src}
                                    src={panel.src}
                                    alt={panel.alt}
                                    width={panel.width}
                                    height={panel.height}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-auto block animate-[hero-pop_0.4s_cubic-bezier(0.23,1,0.32,1)]"
                                    style={{ '--hero-rot': '0deg' }}
                                />
                            </div>
                        </div>
                    </div>

                    <Reveal className="mt-20 sm:mt-28">
                        <div className="flex items-center gap-3 mb-10 justify-center text-center">
                            <Smartphone size={22} className="text-[#ff5b00] shrink-0" aria-hidden="true" />
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#083d5a]">Y en el celular de tus clientes y repartidores</h3>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8 max-w-4xl mx-auto">
                            {CAPTURAS_CELULAR.map(({ src, alt, titulo, texto }, i) => (
                                <figure key={src} className={`max-w-[260px] mx-auto sm:max-w-none ${i === 1 ? 'sm:mt-10' : ''}`}>
                                    <div className="rounded-[1.75rem] overflow-hidden border-[5px] border-[#25323f] shadow-xl shadow-[#083d5a]/20 bg-white">
                                        <img src={src} alt={alt} width="720" height="1300" loading="lazy" decoding="async" className="w-full h-auto block" />
                                    </div>
                                    <figcaption className="mt-5 text-center">
                                        <h4 className="text-lg font-extrabold text-[#083d5a]">{titulo}</h4>
                                        <p className="text-base text-[#305a83] font-medium">{texto}</p>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* Precio */}
                <section id="precio" className="bg-white py-20 sm:py-28">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <Reveal className="text-center max-w-2xl mx-auto mb-10">
                            <Etiqueta>Precio</Etiqueta>
                            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#083d5a] mb-4 leading-[1.05]">Dos planes, sin comisiones</h2>
                            <p className="text-lg text-[#305a83] font-medium mb-8">Elegí el que mejor te quede. Los dos incluyen 10 días gratis.</p>
                            <div className="inline-flex items-center gap-1 rounded-full bg-[#083d5a]/6 p-1" role="group" aria-label="Frecuencia de pago">
                                {[{ v: false, t: 'Mensual' }, { v: true, t: 'Anual' }].map(({ v, t }) => (
                                    <button
                                        key={t}
                                        type="button"
                                        aria-pressed={anual === v}
                                        onClick={() => setAnual(v)}
                                        className={`min-h-[44px] px-6 rounded-full font-extrabold text-sm sm:text-base inline-flex items-center gap-2 transition-[background-color,color] duration-200 ${anual === v ? 'bg-[#083d5a] text-white' : 'text-[#305a83] hover:text-[#ff5b00]'}`}
                                    >
                                        {t}
                                        {v && <span className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 ${anual ? 'bg-[#ff5b00] text-white' : 'bg-[#ff5b00]/15 text-[#ff5b00]'}`}>-15%</span>}
                                    </button>
                                ))}
                            </div>
                        </Reveal>

                        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto items-stretch">
                            {PLANES.map((plan, i) => {
                                const premium = plan.id === 'premium';
                                const precio = prices[plan.id][anual ? 'anual' : 'mensual'];
                                return (
                                    <Reveal key={plan.id} delay={i * 100} className="h-full">
                                        <div className={`relative h-full flex flex-col rounded-[2rem] sm:rounded-[2.5rem] p-7 sm:p-9 overflow-hidden ${premium ? 'bg-[#25323f] text-white shadow-2xl shadow-[#083d5a]/30 landing-grain' : 'bg-[#fbf8f4] text-[#25323f] ring-1 ring-[#083d5a]/10'}`}>
                                            <div className="relative z-10 flex flex-wrap items-center gap-2 mb-5">
                                                <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full ${premium ? 'bg-[#ff5b00] text-white' : 'bg-[#083d5a] text-white'}`}>{plan.nombre}</span>
                                                {premium && <span className="bg-emerald-600 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full">Recomendado</span>}
                                            </div>
                                            <p className={`relative z-10 text-sm sm:text-base font-bold mb-5 ${premium ? 'text-gray-300' : 'text-[#305a83]'}`}>{plan.resumen}</p>
                                            <div className="relative z-10 flex items-baseline gap-2 mb-1">
                                                <span className={`text-4xl sm:text-5xl font-extrabold tabular-nums ${premium ? 'text-white' : 'text-[#083d5a]'}`}>${precio.toLocaleString('es-AR')}</span>
                                                <span className={`font-bold ${premium ? 'text-gray-300' : 'text-[#305a83]'}`}>{anual ? 'por año' : 'por mes'}</span>
                                            </div>
                                            <p className={`relative z-10 text-sm font-bold mb-6 min-h-[20px] ${premium ? 'text-[#ffaa66]' : 'text-[#ff5b00]'}`}>
                                                {anual ? 'Ahorrás 15% pagando por año' : `O $${prices[plan.id].anual.toLocaleString('es-AR')} por año`}
                                            </p>

                                            <ul className="relative z-10 space-y-3.5 mb-8 flex-1">
                                                {plan.incluye.map(item => (
                                                    <li key={item} className={`flex items-start gap-3 font-bold ${premium ? 'text-white' : 'text-[#25323f]'}`}>
                                                        <Check className="text-[#ff5b00] shrink-0 mt-0.5" size={20} strokeWidth={3} aria-hidden="true" /> {item}
                                                    </li>
                                                ))}
                                                {plan.noIncluye && (
                                                    <li className="flex items-start gap-3 font-bold text-[#305a83]/70">
                                                        <Minus className="shrink-0 mt-0.5" size={20} strokeWidth={3} aria-hidden="true" /> {plan.noIncluye}
                                                    </li>
                                                )}
                                            </ul>

                                            <Link to="/register" className={`relative z-10 w-full min-h-[56px] rounded-2xl font-extrabold text-lg flex items-center justify-center transition-[transform,background-color,color] duration-200 active:scale-[0.97] ${premium ? 'bg-[#ff5b00] hover:bg-[#ef4c00] text-white shadow-lg shadow-[#ff5b00]/25' : 'bg-white ring-1 ring-[#083d5a]/15 text-[#083d5a] hover:ring-[#ff5b00] hover:text-[#ff5b00]'}`}>
                                                Probalo 10 días gratis
                                            </Link>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>

                        <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
                            {[
                                { icon: BadgePercent, t: 'Sin comisiones por venta' },
                                { icon: Zap, t: 'Hoy no pagás nada. Si no cancelás antes del día 10, se cobra el plan' },
                                { icon: ShieldCheck, t: 'Cancelás online cuando quieras' }
                            ].map(({ icon, t }) => {
                                const Icon = icon;
                                return (
                                    <li key={t} className="flex items-center gap-3 font-bold text-[#25323f] text-sm sm:text-base">
                                        <span className="w-9 h-9 shrink-0 rounded-xl bg-[#ff5b00]/10 text-[#ff5b00] flex items-center justify-center"><Icon size={18} aria-hidden="true" /></span>
                                        {t}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>

                {/* Preguntas frecuentes */}
                <section id="preguntas" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16">
                    <Reveal>
                        <Etiqueta>Preguntas</Etiqueta>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#083d5a] leading-[1.05]">Preguntas que nos hacen</h2>
                    </Reveal>
                    <div className="divide-y divide-[#083d5a]/10 border-y border-[#083d5a]/10">
                        {PREGUNTAS.map(({ p, r }, i) => (
                            <Reveal key={p} delay={i * 50}>
                                <details className="group">
                                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none min-h-[64px] py-5 font-extrabold text-lg text-[#25323f] hover:text-[#ff5b00] transition-colors [&::-webkit-details-marker]:hidden">
                                        {p}
                                        <span className="shrink-0 w-9 h-9 rounded-full bg-white ring-1 ring-[#083d5a]/10 flex items-center justify-center text-[#ff5b00] transition-transform duration-200 group-open:rotate-45">
                                            <Plus size={18} aria-hidden="true" />
                                        </span>
                                    </summary>
                                    <p className="pb-6 pr-12 text-base sm:text-lg text-[#305a83] font-medium leading-relaxed">{r}</p>
                                </details>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Cierre */}
                <section className="px-4 sm:px-6 pb-20 sm:pb-28">
                    <Reveal className="relative max-w-6xl mx-auto rounded-[2rem] sm:rounded-[3rem] bg-[#083d5a] text-white text-center px-6 py-16 sm:py-24 overflow-hidden landing-grain">
                        <div aria-hidden="true" className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[640px] h-[320px] rounded-full bg-[#ff5b00]/35 blur-3xl pointer-events-none" />
                        <div className="relative">
                            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-[1.05]">Probalo en tu local</h2>
                            <p className="text-lg text-white/80 font-medium mb-9">10 días gratis para probarlo.</p>
                            <Link to="/register" className={botonPrincipal}>
                                Crear mi cuenta <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                            </Link>
                        </div>
                    </Reveal>
                </section>
            </main>

            <footer className="border-t border-[#083d5a]/10 py-8 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <img src="/logo-acommerr.png" alt="Acommerr" className="h-8 object-contain" />
                    <a href="mailto:acommerr@gmail.com" className="text-sm font-bold text-[#305a83] hover:text-[#ff5b00] transition-colors">acommerr@gmail.com</a>
                    <p className="text-sm font-bold text-[#305a83]">© 2026 Acommerr</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
