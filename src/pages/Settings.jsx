import { useState, useEffect } from 'react';
import { Save, ShieldCheck, Key, Palette, Image as ImageIcon, Loader2, Phone, Truck, Database, DollarSign, Link, FileText, Download, Upload } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user, token, login } = useAuth();
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
        envio_gratis_desde: '',
        direccion: '',
        ciudad: '',
        control_insumos: true,
        cvu: '',
        alias: '',
        afip_cuit: '',
        afip_punto_venta: '',
        afip_condicion_iva: '',
        afip_habilitado: false,
        afip_clave_fiscal: '',
        mp_oauth_user_id: '',
        codigos_postales: '',
        has_afip_cert: false,
        has_afip_key: false
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [generatingCsr, setGeneratingCsr] = useState(false);
    const [csrData, setCsrData] = useState('');
    const [uploadingCert, setUploadingCert] = useState(false);

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

    const handleGenerateCSR = async () => {
        if (!config.afip_cuit) {
            setMessage({ type: 'error', text: 'Por favor, ingresá y guardá tu CUIT antes de generar el CSR.' });
            return;
        }
        setGeneratingCsr(true);
        try {
            const response = await api.post('/admin/billing/generate-csr', {
                cuit: config.afip_cuit,
                alias: config.nombre.replace(/[^a-zA-Z0-9]/g, '') || 'Pizzeria'
            });
            const { csr } = response.data;
            setCsrData(csr);
            
            // Descargar automáticamente como archivo
            const element = document.createElement("a");
            const file = new Blob([csr], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = `pedido_${config.afip_cuit}.csr`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            
            setMessage({ type: 'success', text: '¡CSR generado y descargado! Ahora podés subirlo a AFIP.' });
            fetchConfig(); // para refrescar has_afip_key si cambió
        } catch (error) {
            console.error('Error al generar CSR:', error);
            setMessage({ type: 'error', text: 'Error al generar la Solicitud de Certificado (CSR).' });
        } finally {
            setGeneratingCsr(false);
        }
    };

    const handleCertFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            setUploadingCert(true);
            try {
                await api.post('/admin/billing/upload-cert', { certificado: content });
                setMessage({ type: 'success', text: '¡Certificado subido correctamente!' });
                fetchConfig(); // Para recargar has_afip_cert
            } catch (error) {
                console.error('Error al subir certificado:', error);
                setMessage({ type: 'error', text: 'Error al subir el certificado' });
            } finally {
                setUploadingCert(false);
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/admin/config', config);
            setMessage({ type: 'success', text: '¡Configuración guardada con éxito!' });
            login({
                ...user,
                nombre: config.nombre,
                logo_url: config.logo_url,
                color_primario: config.color_primario,
                color_secundario: config.color_secundario,
                direccion: config.direccion,
                ciudad: config.ciudad
            }, token);
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
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight italic uppercase">Configuración</h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Personalizá tu negocio/pizzería y métodos de pago</p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-gold-600 hover:bg-gold-700 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-xl shadow-gold-100 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 cursor-pointer"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl font-bold flex items-center gap-3 animate-in slide-in-from-top-4 ${
                    message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    <ShieldCheck size={20} />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
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
                                        value={config.color_primario || '#ff5b00'}
                                        onChange={(e) => setConfig({...config, color_primario: e.target.value})}
                                    />
                                    <span className="font-mono font-bold text-gray-500 text-xs">{config.color_primario || '#ff5b00'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Color Secundario</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-xl border-2 border-gray-100 p-1 cursor-pointer"
                                        value={config.color_secundario || '#083d5a'}
                                        onChange={(e) => setConfig({...config, color_secundario: e.target.value})}
                                    />
                                    <span className="font-mono font-bold text-gray-500 text-xs">{config.color_secundario || '#083d5a'}</span>
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

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dirección del Local</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-green-600 outline-none font-bold text-sm"
                                value={config.direccion || ''}
                                onChange={(e) => setConfig({...config, direccion: e.target.value})}
                                placeholder="Ej: Florida 550"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ciudad</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-green-600 outline-none font-bold text-sm"
                                value={config.ciudad || ''}
                                onChange={(e) => setConfig({...config, ciudad: e.target.value})}
                                placeholder="Ej: Vicente López, Buenos Aires"
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

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Códigos Postales Habilitados (separados por comas)</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-purple-600 outline-none font-mono text-sm"
                                value={config.codigos_postales || ''}
                                onChange={(e) => setConfig({...config, codigos_postales: e.target.value})}
                                placeholder="Ej: 1602, 1603, 1640"
                            />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Dejar vacío para permitir envíos a cualquier código postal.</p>
                        </div>
                    </div>
                </div>

                {/* Control de Inventario */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Database className="text-amber-600" size={20} /> Control de Inventario
                    </h2>
                    
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-2">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                            Control Automático de Insumos
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                            Si está activo, al aprobar o entregar pedidos desde el panel de órdenes se descontará automáticamente la cantidad de insumos definida en la receta de cada producto.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl cursor-pointer hover:bg-gray-100/70 transition-all border-2 border-gray-100 select-none">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded text-gold-600 focus:ring-gold-500 border-gray-300 cursor-pointer"
                                checked={!!config.control_insumos}
                                onChange={(e) => setConfig({...config, control_insumos: e.target.checked})}
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800 text-sm">Control de Insumos Activo</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Descontar insumos automáticamente al vender</span>
                            </div>
                        </label>
                         </div>
                </div>

                {/* AFIP/ARCA Facturación */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <FileText className="text-purple-600" size={20} /> AFIP / ARCA Facturación Electrónica
                    </h2>
                    
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-2">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                            Facturación Automática y Directa
                        </p>
                        <p className="text-xs text-purple-700 leading-relaxed font-medium">
                            Completá tus datos impositivos y configurá el certificado digital (.crt) para automatizar la emisión de facturas electrónicas a tus clientes de forma 100% gratuita y segura.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Datos impositivos básicos */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">1. Datos Impositivos</h3>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">CUIT del Emisor</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-purple-600 outline-none font-mono text-sm"
                                    value={config.afip_cuit || ''}
                                    onChange={(e) => setConfig({...config, afip_cuit: e.target.value.replace(/\D/g, '')})}
                                    placeholder="Ej: 20304567891"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Punto de Venta</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-purple-600 outline-none font-mono text-sm"
                                    value={config.afip_punto_venta || ''}
                                    onChange={(e) => setConfig({...config, afip_punto_venta: e.target.value ? Number(e.target.value) : ''})}
                                    placeholder="Ej: 5"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Condición Frente al IVA</label>
                                <select
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-purple-600 outline-none font-bold text-sm"
                                    value={config.afip_condicion_iva || ''}
                                    onChange={(e) => setConfig({...config, afip_condicion_iva: e.target.value})}
                                >
                                    <option value="">Seleccionar condición</option>
                                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                                    <option value="Monotributo">Monotributo</option>
                                    <option value="Exento">Exento</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl cursor-pointer hover:bg-gray-100/70 transition-all border-2 border-gray-100 select-none">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-gray-300 cursor-pointer"
                                    checked={!!config.afip_habilitado}
                                    onChange={(e) => setConfig({...config, afip_habilitado: e.target.checked})}
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-sm">Habilitar Facturación Automática</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Emitir facturas al aprobar cobros</span>
                                </div>
                            </label>
                        </div>

                        {/* Asistente de certificados */}
                        <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">2. Certificado Digital</h3>

                            {/* Estado del Certificado */}
                            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed bg-gray-50">
                                <div className={`p-2 rounded-xl ${config.has_afip_cert && config.has_afip_key ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-gray-800">
                                        {config.has_afip_cert && config.has_afip_key ? 'Certificado Activo' : 'Falta Configurar Certificado'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                                        {config.has_afip_cert && config.has_afip_key ? 'Conexión con AFIP lista' : 'Seguí los pasos a continuación'}
                                    </span>
                                </div>
                            </div>

                            {/* Pasos */}
                            <div className="space-y-4">
                                {/* Paso A: Generar CSR */}
                                <div className="space-y-2">
                                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest block">Paso A: Generar pedido (.csr)</span>
                                    <p className="text-[11px] text-gray-500 font-medium">Generá la clave privada y descargá la solicitud de firma (.csr).</p>
                                    <button
                                        type="button"
                                        disabled={generatingCsr || !config.afip_cuit}
                                        onClick={handleGenerateCSR}
                                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-100"
                                    >
                                        {generatingCsr ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                                        {generatingCsr ? 'Generando...' : 'Generar y Descargar CSR'}
                                    </button>
                                    {!config.afip_cuit && (
                                        <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">⚠️ Completá y guardá el CUIT antes de generar el CSR.</p>
                                    )}
                                </div>

                                {/* Paso B: Subir Certificado de AFIP */}
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest block">Paso B: Subir Certificado (.crt)</span>
                                    <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs text-gray-600 border border-gray-100">
                                        <p className="font-bold">¿Cómo obtener el certificado en AFIP?</p>
                                        <ol className="list-decimal list-inside space-y-1 text-gray-500 font-medium text-[11px]">
                                            <li>Entrá en <a href="https://auth.afip.gob.ar/contribuyente/" target="_blank" rel="noreferrer" className="text-purple-600 font-bold underline">AFIP con Clave Fiscal</a>.</li>
                                            <li>Adherí el servicio <b>"Administración de Certificados Digitales"</b>.</li>
                                            <li>Cargá el archivo <b>.csr</b> obtenido en el Paso A.</li>
                                            <li>Descargá el archivo <b>.crt</b> firmado y subilo aquí abajo:</li>
                                        </ol>
                                    </div>
                                    
                                    <div className="relative">
                                        <label className="w-full bg-white border-2 border-dashed border-gray-200 hover:border-purple-600 transition-all p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer text-center group">
                                            <input
                                                type="file"
                                                accept=".crt,.pem,.txt"
                                                onChange={handleCertFileChange}
                                                className="hidden"
                                                disabled={uploadingCert}
                                            />
                                            {uploadingCert ? (
                                                <Loader2 className="animate-spin text-purple-600" size={24} />
                                            ) : (
                                                <Upload className="text-gray-300 group-hover:text-purple-600 transition-colors" size={24} />
                                            )}
                                            <span className="text-[11px] font-bold text-gray-700 mt-2">
                                                {uploadingCert ? 'Subiendo certificado...' : 'Seleccionar archivo .crt'}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Formatos: .crt, .pem, .txt</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </form>
    );
};

export default Settings;
