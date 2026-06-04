import { BookOpen, Package, Key, Play, ShieldAlert, ShoppingBag, Database, Bike, Settings, FileText, LayoutDashboard, ExternalLink } from 'lucide-react';

const Support = () => {
    const tutorials = [
        {
            id: 'productos',
            title: '1. Cómo Cargar Productos e Inventario',
            icon: <Package className="text-gold-600" size={24} />,
            description: 'Guía paso a paso para administrar tus categorías, productos, precios, fotos y la asociación de recetas para el control de insumos.',
            steps: [
                'Dirigite a la sección de **Inventario** en el menú lateral.',
                'Para crear una categoría nueva (ej. "Pizzas Especiales"), hacé click en el botón de categorías, escribila y guardala.',
                'Para añadir un producto, seleccioná **Agregar Producto**.',
                'Completá el nombre, descripción, precio base, categoría y pegá el link de la imagen de tu producto.',
                'Si tenés activo el Control de Insumos, asigná la cantidad de ingredientes (receta) que consume este producto al venderse. Esto descontará stock automáticamente.'
            ]
        },
        {
            id: 'mercadopago',
            title: '2. Conectar Mercado Pago Checkout Pro',
            icon: <Key className="text-blue-600" size={24} />,
            description: 'Vinculá tu cuenta de Mercado Pago para procesar cobros de forma 100% automática y recibir el dinero al instante.',
            steps: [
                'Ingresá al panel de **Mercado Pago Developers** (desarrolladores) con tu cuenta de Mercado Pago.',
                'Creá una aplicación o dirigite a **Credenciales de Producción**.',
                'Copiá tu **Public Key** (ej. APP_USR-xxxx...) y tu **Access Token** (ej. APP_USR-yyyy...).',
                'Dirigite a la sección de **Configuración** en el menú de este administrador.',
                'Pegá ambas claves en la tarjeta de **Mercado Pago** y hacé click en **Guardar Cambios**.',
                'Una vez configurado, tu tienda ya está lista para cobrar automáticamente mediante Tarjeta de Crédito, Débito y Dinero en cuenta.'
            ]
        }
    ];

    const features = [
        {
            title: 'Dashboard de Métricas',
            icon: <LayoutDashboard className="text-indigo-600" size={20} />,
            desc: 'Visualizá tus ventas diarias, pedidos activos, facturación total y los productos más vendidos en tiempo real para tomar mejores decisiones comerciales.'
        },
        {
            title: 'Gestión de Pedidos en Vivo',
            icon: <ShoppingBag className="text-emerald-600" size={20} />,
            desc: 'Aprobá pedidos, visualizá el detalle de productos del cliente, controlá el estado (Preparando -> En camino -> Entregado) e imprimí comandas en papel térmico de un solo click.'
        },
        {
            title: 'Control de Insumos e Ingredientes',
            icon: <Database className="text-amber-600" size={20} />,
            desc: 'Cargá tu materia prima en la sección de Insumos y definí recetas por producto. El sistema se encarga de restar el stock y alertarte si algún ingrediente está por agotarse.'
        },
        {
            title: 'Repartidores y QR de Auto-Asignación',
            icon: <Bike className="text-purple-600" size={20} />,
            desc: 'Creá usuarios para tus cadetes con un código PIN de acceso rápido. Al imprimir el ticket de un pedido, se generará un código QR único que el repartidor escanea con su celular para auto-asignarse el envío de forma privada.'
        },
        {
            title: 'Facturación Electrónica (AFIP/ARCA)',
            icon: <FileText className="text-rose-600" size={20} />,
            desc: 'Habilitá la facturación automática ingresando tus datos fiscales en Configuración. Cada vez que cobres un pedido, el sistema emitirá el comprobante electrónico fiscal sin que tengas que hacer nada.'
        },
        {
            title: 'Branding, Diseño y Horarios',
            icon: <Settings className="text-slate-600" size={20} />,
            desc: 'Subí tu propio logo, cambiá los colores principales y secundarios de tu e-commerce, definí tus horarios de atención, costo de delivery y WhatsApp de contacto desde un solo panel.'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            
            {/* Cabecera / Hero */}
            <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold-600/15 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 space-y-4 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-gold-600/20 text-gold-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-gold-500/20">
                        <BookOpen size={14} /> Centro de Aprendizaje
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Centro de Soporte <br />
                        <span className="text-gold-500">y Documentación</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed">
                        Acá vas a encontrar guías completas para configurar tu negocio, conectar pasarelas de pago y dominar todas las herramientas que ofrece tu panel de administración.
                    </p>
                </div>
            </div>

            {/* Grid de Guías Principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {tutorials.map((tutorial) => (
                    <div key={tutorial.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    {tutorial.icon}
                                </div>
                                <h2 className="text-xl font-black text-gray-800 tracking-tight">{tutorial.title}</h2>
                            </div>
                            
                            <p className="text-gray-500 font-semibold text-sm leading-relaxed">
                                {tutorial.description}
                            </p>

                            <ul className="space-y-2.5 pt-2">
                                {tutorial.steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                                        <span className="text-gold-600 font-bold shrink-0">{idx + 1}.</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contenedor del Vídeo Tutorial */}
                        <div className="pt-4 border-t border-gray-50">
                            <div className="bg-slate-50 border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-2 group hover:border-gold-500 hover:bg-slate-100/50 transition-all cursor-pointer">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:scale-115 group-hover:bg-red-100 transition-all shadow-sm">
                                    <Play size={20} fill="currentColor" className="ml-0.5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-gray-700 text-sm uppercase tracking-wide">Video Tutorial en camino</p>
                                    <p className="text-xs text-gray-400 font-bold">
                                        Próximamente disponible. Hacé click para reproducir en YouTube cuando esté cargado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Listado de Funcionalidades */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic flex items-center gap-2">
                        <ShoppingBag className="text-gold-600" size={24} /> Manual de Funcionalidades
                    </h2>
                    <p className="text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                        Explorá todos los módulos integrados que potencian tu negocio día a día
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feat, idx) => (
                        <div key={idx} className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg hover:shadow-gray-100 hover:border-gold-500/20 transition-all duration-300 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
                                    {feat.icon}
                                </div>
                                <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">{feat.title}</h3>
                            </div>
                            <p className="text-gray-500 font-medium text-xs leading-relaxed">
                                {feat.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ayuda y Soporte */}
            <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 shrink-0">
                        <ShieldAlert size={24} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black text-amber-900 text-base uppercase tracking-tight">¿Seguís con dudas o necesitás asistencia personalizada?</h3>
                        <p className="text-amber-800/80 font-medium text-sm">
                            Comunicate directamente con nuestro equipo técnico para resolver cualquier inconveniente con tu configuración.
                        </p>
                    </div>
                </div>
                <a 
                    href="https://wa.me/5491112345678" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-amber-700 hover:bg-amber-800 text-white font-black text-sm uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0"
                >
                    Contactar Soporte <ExternalLink size={14} />
                </a>
            </div>

        </div>
    );
};

export default Support;
