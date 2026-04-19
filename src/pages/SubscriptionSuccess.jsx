import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

const SubscriptionSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);

    const empresaId = searchParams.get('empresaId');
    const plan = searchParams.get('plan');

    // Simulación de activación (En producción deberías usar webhooks para confirmar el pago real)
    useEffect(() => {
        const activateSubscription = async () => {
            try {
                await api.post('/subscriptions/confirm', {
                    empresaId: empresaId,
                    plan: plan
                });
            } catch (error) {
                console.error("Error confirmando suscripción:", error);
            } finally {
                setVerifying(false);
            }
        };

        if (empresaId) activateSubscription();
    }, [empresaId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-gray-100">
                {verifying ? (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader2 className="h-20 w-20 text-orange-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Procesando tu suscripción...</h2>
                        <p className="text-gray-500">Estamos confirmando tu pago con Mercado Pago. No cierres esta ventana.</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-700">
                        <div className="flex justify-center mb-8">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle size={64} className="text-green-600" />
                            </div>
                        </div>
                        
                        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">¡Bienvenido a la red <span className="text-orange-600">Nexus</span>!</h1>
                        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
                            Tu suscripción <span className="font-black text-gray-800">{plan === 'MONTHLY' ? 'Mensual' : 'Anual'}</span> ha sido activada con éxito. Ya podés empezar a gestionar tu negocio.
                        </p>

                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            Ir al Panel Admin <ArrowRight size={22} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionSuccess;
