import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, BarChart3, Store, CheckCircle2, Zap } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-gold-200">
            {/* Navbar (Landing) */}
            <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <img src="/logo-acommerr.png" alt="A-commerr Logo" className="h-8 object-contain" />
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="font-bold text-[#52677c] hover:text-[#c79f63] transition-colors">
                        Iniciar Sesión
                    </Link>
                    <Link to="/register" className="bg-[#c79f63] hover:bg-[#b98344] text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold-200 transition-all active:scale-95">
                        Crear Cuenta
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                    <div className="w-[600px] h-[600px] bg-[#c79f63]/10 rounded-full blur-3xl" />
                </div>
                <div className="absolute top-40 left-0 -translate-x-1/3">
                    <div className="w-[500px] h-[500px] bg-[#415161]/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-[#25323f] tracking-tight mb-8 leading-tight">
                        La plataforma definitiva <br/> para tu <span className="text-[#c79f63] relative">
                            negocio
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-gold-300" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-[#52677c] mb-12 max-w-2xl mx-auto font-medium">
                        A-commerr ERP es el software integral que conecta tu e-commerce con tu gestión diaria. Ventas, inventario y estadísticas en un solo lugar.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto bg-[#415161] hover:bg-[#25323f] text-white px-8 py-4 rounded-full font-black text-lg flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-[#415161]/20 hover:-translate-y-1">
                            Empezar Ahora <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-[#c79f63] hover:text-[#c79f63] px-8 py-4 rounded-full font-black text-lg text-gray-600 transition-all">
                            Ya tengo un local
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="max-w-7xl mx-auto px-6 mt-32 grid md:grid-cols-3 gap-12">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow border border-white">
                        <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mb-6 text-[#c79f63]">
                            <Store size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-[#25323f] mb-4">Tienda Propia</h3>
                        <p className="text-[#52677c] font-medium leading-relaxed">Tu propio e-commerce con tu logo y tus colores. Recibí pedidos en tiempo real, sin comisiones por venta y con integración directa de Mercado Pago Checkout Pro.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow border border-white relative">
                        <div className="absolute -top-4 -right-4 bg-[#415161] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transform rotate-12">Popular</div>
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-[#415161]">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-[#25323f] mb-4">Gestión Inteligente</h3>
                        <p className="text-[#52677c] font-medium leading-relaxed">Control de inventario en tiempo real, gestión de recetas, automatización de emisión de facturas y actualización rápida de precios.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-shadow border border-white">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                            <BarChart3 size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-[#25323f] mb-4">Estadísticas Pro</h3>
                        <p className="text-[#52677c] font-medium leading-relaxed">Toma decisiones basadas en datos. Seguimiento de ventas, productos más populares y rendimiento de tu negocio día a día.</p>
                    </div>
                </div>

                {/* Pricing / Planes Básicos */}
                <div className="max-w-5xl mx-auto px-6 mt-32 text-center">
                    <h2 className="text-4xl font-black text-[#25323f] mb-4">Planes diseñados para vos</h2>
                    <p className="text-[#52677c] mb-16 font-medium">Elegí la opción que mejor se adapte al tamaño de tu negocio.</p>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Estandar */}
                        <div className="bg-white border-2 border-gray-100 rounded-[3rem] p-10 hover:border-[#c79f63] transition-colors relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-gray-900 group-hover:text-[#c79f63] transition-colors">
                                <Zap size={120} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest text-left mb-2">Estándar</h3>
                            <div className="flex items-baseline gap-2 mb-2 text-left">
                                <span className="text-5xl font-black text-[#25323f]">$40.000</span>
                                <span className="text-gray-500 font-bold">/mes</span>
                            </div>
                            <p className="text-sm font-bold text-[#c79f63] mb-8 text-left">*Ahorrá 20% pagando anual ($384.000)</p>
                            
                            <ul className="space-y-4 text-left relative z-10">
                                <li className="flex items-center gap-3 font-bold text-[#52677c]"><CheckCircle2 className="text-green-500" size={20} /> Todas las funciones operativas conectadas</li>
                                <li className="flex items-center gap-3 font-bold text-[#52677c]"><CheckCircle2 className="text-green-500" size={20} /> Tienda E-commerce y Panel Activo</li>
                                <li className="flex items-center gap-3 font-bold text-[#52677c]"><CheckCircle2 className="text-green-500" size={20} /> Soporte garantizado</li>
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="bg-[#25323f] rounded-[3rem] p-10 relative overflow-hidden group transform md:-translate-y-4 shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
                                <Store size={120} />
                            </div>
                            <div className="absolute top-6 right-8 bg-[#c79f63] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                                Recomendado
                            </div>
                            <h3 className="text-2xl font-black text-gold-200 uppercase tracking-widest text-left mb-2">Pizzería Pro</h3>
                            <div className="flex items-baseline gap-2 mb-2 text-left">
                                <span className="text-5xl font-black text-white">$60.000</span>
                                <span className="text-gray-400 font-bold">/mes</span>
                            </div>
                            <p className="text-sm font-bold text-gold-200 mb-8 text-left">*Ahorrá 20% pagando anual ($576.000)</p>
                            
                            <ul className="space-y-4 text-left relative z-10">
                                <li className="flex items-center gap-3 font-bold text-gray-300"><CheckCircle2 className="text-[#c79f63]" size={20} /> TODO lo del plan estándar</li>
                                <li className="flex items-center gap-3 font-bold text-white"><CheckCircle2 className="text-[#c79f63]" size={40} /> Facturación electrónica automatizada con ARCA (AFIP) a consumidor final</li>
                                <li className="flex items-center gap-3 font-bold text-white"><CheckCircle2 className="text-[#c79f63]" size={20} /> Prioridad máxima en soporte</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Pequeño */}
            <footer className="border-t border-gray-100 py-10 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    © 2026 A-commerr ERP - UNA SOLUCIÓN MULTI-TENANT
                </p>
            </footer>
        </div>
    );
};

export default Landing;
