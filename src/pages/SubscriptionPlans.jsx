import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Check, Zap, Crown, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const SubscriptionPlans = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            id: 'STANDARD',
            name: 'Plan Estándar',
            monthlyPrice: 40000,
            annualPrice: 384000,
            description: 'Ideal para negocios que buscan controlar todo sin emitir facturas automáticas.',
            features: [
                'Tienda Online Personalizada',
                'Gestión de Inventario y Recetas',
                'Panel de Estadísticas Pro',
                'Pedidos Ilimitados',
                'Soporte estándar'
            ],
            icon: <Zap className="text-orange-500" />,
            badge: null
        },
        {
            id: 'PRO',
            name: 'Pizzería Pro',
            monthlyPrice: 60000,
            annualPrice: 576000,
            description: 'La opción recomendada para quienes necesitan facturación a consumidor final directo a AFIP.',
            features: [
                'TODO lo del Plan Estándar',
                'Facturación ARCA (AFIP) Automática',
                'Descarga automática de PDF Tícket',
                'Soporte Prioritario',
                'Funciones de Alta Gerencia'
            ],
            icon: <Crown className="text-yellow-500" />,
            badge: 'Recomendado'
        }
    ];

    const handleSubscribe = async (planType) => {
        setLoading(true);
        try {
            const finalPlanType = `${planId}_${isAnnual ? 'ANNUAL' : 'MONTHLY'}`;
            const response = await api.post('/subscriptions/create', {
                empresaId: companyId,
                planType: finalPlanType
            });

            if (response.data.init_point) {
                window.location.href = response.data.init_point;
            }
        } catch (error) {
            console.error('Error al iniciar suscripción:', error);
            alert('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute top-0 inset-x-0 h-96 bg-[#242f3d] z-0"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl z-0"></div>
            
            <div className="relative z-10 max-w-5xl w-full">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="mb-4 flex justify-center">
                        <img src="https://i.ibb.co/bjwG4tSv/logo-nexus.png" alt="Nexus Logo" className="h-16 brightness-0 invert" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Elegí tu plan y empezá a <span className="text-orange-500">vender</span></h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">Seleccioná las herramientas que mejor se adapten a tu operatoria diaria.</p>
                    
                    {/* Toggle de facturación */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Pago Mensual</span>
                        <button 
                            className="w-16 h-8 bg-gray-700 rounded-full p-1 transition-colors relative"
                            onClick={() => setIsAnnual(!isAnnual)}
                        >
                            <div className={`w-6 h-6 bg-orange-500 rounded-full transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-sm font-bold flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
                            Pago Anual <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-1 rounded-full">-20% OFF</span>
                        </span>
                    </div>
                </div>

                {/* Grilla de Planes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        const finalPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                        return (
                        <div 
                            key={plan.id}
                            className={`relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all duration-500 border-2 ${isSelected ? 'border-orange-500 scale-[1.02]' : 'border-transparent'}`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 right-8 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner">
                                    {plan.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{plan.id === 'STANDARD' ? 'Core Operativo' : 'Kit Completo'}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">${finalPrice.toLocaleString()}</span>
                                <span className="text-gray-400 font-bold ml-1">/ {isAnnual ? 'año' : 'mes'}</span>
                            </div>

                            <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                                {plan.description}
                            </p>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${plan.id === 'PRO' ? 'bg-[#242f3d] text-white hover:bg-black shadow-gray-200' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100 hover:-translate-y-1'}`}
                            >
                                {loading ? 'Cargando MP...' : (
                                    <>
                                        Continuar con {plan.name} <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                        );
                    })}
                </div>

                {/* Footer del selector */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-400 pb-12">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-green-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Pago seguro con Mercado Pago</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-xs font-black uppercase tracking-widest hover:text-[#f9804d] flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={16} /> Volver al Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;
