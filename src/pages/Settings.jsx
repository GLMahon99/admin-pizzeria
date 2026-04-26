import { useState, useEffect } from 'react';
import { Save, ShieldCheck, Key, Palette, Image as ImageIcon, Loader2, Phone, Truck } from 'lucide-react';
import api from '../api/axiosConfig';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        nombre: '',
        logo_url: '',
        color_primario: '',
        color_secundario: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        horarios_atencion: '',
        mp_public_key: '',
        mp_access_token: '',
        costo_envio: 0,
        envio_gratis_desde: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get('/admin/config-details');
            setConfig(response.data);
        } catch (error) {
            console.error('Error al cargar config:', error);
            setMessage({ type: 'error', text: 'Error al cargar la configuración' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/admin/config', config);
            setMessage({ type: 'success', text: '¡Configuración guardada con éxito!' });
            // Recargar la página para aplicar cambios visuales si los hay
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error('Error al guardar:', error);
            setMessage({ type: 'error', text: 'No se pudo guardar la configuración' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-gold-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight italic uppercase">Configuración</h1>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Personalizá tu negocio/pizzería y métodos de pago</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl font-bold flex items-center gap-3 animate-in slide-in-from-top-4 ${
                    message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    <ShieldCheck size={20} />
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Branding */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Palette className="text-gold-600" size={20} /> Branding y Diseño
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Local</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-gold-600 outline-none font-bold"
                                value={config.nombre}
                                onChange={(e) => setConfig({...config, nombre: e.target.value})}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">URL del Logo (Link)</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-4 pl-12 rounded-2xl focus:border-gold-600 outline-none font-bold"
                                    value={config.logo_url}
                                    onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Color Principal</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-xl border-2 border-gray-100 p-1 cursor-pointer"
                                        value={config.color_primario || '#b98344'}
                                        onChange={(e) => setConfig({...config, color_primario: e.target.value})}
                                    />
                                    <span className="font-mono font-bold text-gray-500 text-xs">{config.color_primario || '#b98344'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Color Secundario</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-xl border-2 border-gray-100 p-1 cursor-pointer"
                                        value={config.color_secundario || '#1F2937'}
                                        onChange={(e) => setConfig({...config, color_secundario: e.target.value})}
                                    />
                                    <span className="font-mono font-bold text-gray-500 text-xs">{config.color_secundario || '#1F2937'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Redes Sociales y Contacto */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Phone className="text-green-600" size={20} /> Redes y Contacto
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Número de WhatsApp</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-green-600 outline-none font-bold"
                                value={config.whatsapp}
                                onChange={(e) => setConfig({...config, whatsapp: e.target.value})}
                                placeholder="Ej: 5491112345678"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Link de Instagram</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-pink-600 outline-none font-bold text-sm"
                                value={config.instagram}
                                onChange={(e) => setConfig({...config, instagram: e.target.value})}
                                placeholder="https://instagram.com/tu_pizzeria"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Link de Facebook</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-700 outline-none font-bold text-sm"
                                value={config.facebook}
                                onChange={(e) => setConfig({...config, facebook: e.target.value})}
                                placeholder="https://facebook.com/tu_pizzeria"
                            />
                        </div>
                    </div>

                        <div className="space-y-2 mt-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Días y Horarios de Atención</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-green-600 outline-none font-bold text-sm"
                                value={config.horarios_atencion || ''}
                                onChange={(e) => setConfig({...config, horarios_atencion: e.target.value})}
                                placeholder="Ej: Lunes a Domingos de 19:30 a 23:30 hs"
                            />
                        </div>
                </div>

                {/* Mercado Pago */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Key className="text-blue-600" size={20} /> Mercado Pago
                    </h2>
                    
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-2">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={12} /> Configuración Segura
                        </p>
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            Estas llaves son necesarias para recibir los pagos directamente en tu cuenta de Mercado Pago.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Public Key (APP_USR-...)</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-600 outline-none font-mono text-sm"
                                value={config.mp_public_key}
                                onChange={(e) => setConfig({...config, mp_public_key: e.target.value})}
                                placeholder="APP_USR-xxxx-xxxx-xxxx-xxxx"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Access Token (APP_USR-...)</label>
                            <input
                                type="password"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-600 outline-none font-mono text-sm"
                                value={config.mp_access_token}
                                onChange={(e) => setConfig({...config, mp_access_token: e.target.value})}
                                placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                        </div>
                    </div>
                </div>

                {/* Envío y Logística */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Truck className="text-purple-600" size={20} /> Envío y Logística
                    </h2>
                    
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-2">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                            Opciones de Delivery
                        </p>
                        <p className="text-xs text-purple-700 leading-relaxed font-medium">
                            Si dejas el costo en 0, se mostrará como "Envío Gratis". También podes bonificar el envío superando cierto monto.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Costo Fijo de Envío ($)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-purple-600 outline-none font-mono text-sm"
                                value={config.costo_envio || 0}
                                onChange={(e) => setConfig({...config, costo_envio: Number(e.target.value)})}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Envío Gratis Desde ($) (Opcional)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-purple-600 outline-none font-mono text-sm"
                                value={config.envio_gratis_desde || ''}
                                onChange={(e) => setConfig({...config, envio_gratis_desde: e.target.value ? Number(e.target.value) : ''})}
                                placeholder="Ej: 15000"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gold-600 hover:bg-gold-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-gold-100 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
