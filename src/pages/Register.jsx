import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Lock, Building, AlertCircle, Hash, ArrowRight, X, Shield } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        cuit: '',
        slug: '',
        email_contacto: '', // Nuevo campo
        password: '',
        confirmPassword: '',
        terminos_aceptados: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Auto-generar slug desde el nombre si se está escribiendo el nombre
        if (name === 'nombre') {
            const autoSlug = value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData({ ...formData, nombre: value, slug: autoSlug });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/register-company', formData);
            // Redirigir a la elección de planes
            navigate(`/subscription-plans/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al intentar registrar la empresa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            {/* Fondo con decoraciones abstractas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff5b00]/10 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#083d5a]/10 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-md w-full relative">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="mb-8 flex justify-center transform hover:scale-105 transition-transform duration-500">
                            <div className="flex items-center justify-center gap-2"><img src="/logo-acommerr.png" alt="A-commerr Logo" className="h-16 object-contain" /></div>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sumá tu <span className="text-[#ff5b00]">Empresa</span></h1>
                        <p className="text-gray-500 mt-2 font-medium">Unite a la red más grande de ecommerce sin comisiones.</p>
                    </div>

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nombre de la Empresa */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nombre Comercial</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    value={formData.nombre}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800"
                                    placeholder="Ej: La Posta del Horno"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email de Contacto */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email de Contacto</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                                <input
                                    type="email"
                                    name="email_contacto"
                                    required
                                    value={formData.email_contacto}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800"
                                    placeholder="contacto@pizzeria.com"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* CUIT y Slug en una fila */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">CUIT</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="cuit"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800"
                                        placeholder="20-XXXXXXXX-X"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Slug (URL)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="slug"
                                        readOnly
                                        value={formData.slug}
                                        className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-2xl font-bold text-gray-500 cursor-not-allowed outline-none"
                                        placeholder="laposta-horno"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Repetir Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Aceptación de Términos y Condiciones */}
                        <div className="flex items-start gap-3 py-2 px-1">
                            <input
                                type="checkbox"
                                id="terminos_aceptados"
                                name="terminos_aceptados"
                                required
                                checked={formData.terminos_aceptados}
                                onChange={(e) => setFormData({ ...formData, terminos_aceptados: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-[#ff5b00] focus:ring-[#ff5b00]/30 mt-1 cursor-pointer accent-[#ff5b00]"
                            />
                            <label htmlFor="terminos_aceptados" className="text-xs font-bold text-gray-500 leading-normal cursor-pointer select-none">
                                Acepto los{' '}
                                <button
                                    type="button"
                                    onClick={() => setShowTerms(true)}
                                    className="text-[#ff5b00] font-black hover:underline cursor-pointer"
                                >
                                    Términos y Condiciones
                                </button>{' '}
                                y la{' '}
                                <button
                                    type="button"
                                    onClick={() => setShowTerms(true)}
                                    className="text-[#ff5b00] font-black hover:underline cursor-pointer"
                                >
                                    Política de Privacidad
                                </button>{' '}
                                conforme a las Leyes N° 24.240 y N° 25.326.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-gold-600 to-red-600 hover:from-gold-700 hover:to-red-700 text-white rounded-2xl font-black shadow-xl shadow-gold-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Creando Empresa...' : (
                                <>
                                    Registrar Mi Negocio <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            ¿Ya tenés una cuenta?{' '}
                            <Link to="/login" className="text-[#ff5b00] font-black hover:underline underline-offset-4">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                    OMNIBUSINESS PRO - PLATAFORMA MULTI-TENANT
                </p>
            </div>

            {/* Modal de Términos y Condiciones */}
            {showTerms && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-gray-100 text-left">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-[#ff5b00]">
                                <Shield size={24} />
                                <h2 className="text-xl font-black text-gray-900">Términos, Condiciones y Privacidad</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTerms(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-600 leading-relaxed font-medium">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-black">Última actualización: Mayo 2026</p>
                            
                            <div className="space-y-2">
                                <h3 className="font-black text-gray-800 text-base">1. Marco Legal General (Leyes N° 24.240 y N° 25.326)</h3>
                                <p>El presente contrato regula los términos de uso del software SaaS provisto por **A-commerr ERP**. Al registrarse, usted acepta este acuerdo de adhesión electrónica en los términos de la **Ley de Defensa del Consumidor N° 24.240** y la **Ley de Protección de Datos Personales N° 25.326** de la República Argentina.</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-black text-gray-800 text-base">2. Privacidad y Tratamiento de Datos (Ley N° 25.326)</h3>
                                <p>**A-commerr ERP** actúa en carácter de **Encargado de Tratamiento** ("Data Processor") respecto a la información cargada por usted (clientes finales, pedidos, direcciones, DNIs y teléfonos). La Empresa registrante asume el rol de **Responsable de la Base de Datos** ("Data Controller") y se compromete a contar con el consentimiento de sus clientes para procesar sus pedidos.</p>
                                <p>Nos comprometemos a implementar medidas de seguridad técnicas y organizativas para proteger la confidencialidad de la información y no divulgarla ni venderla bajo ninguna circunstancia. Los titulares de los datos tienen derecho de acceso, rectificación y supresión conforme a la normativa de la **Agencia de Acceso a la Información Pública (AAIP)**.</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-black text-gray-800 text-base">3. Integraciones de Terceros (Mercado Pago y AFIP/ARCA)</h3>
                                <p>**Mercado Pago:** Los pagos en línea son procesados de forma directa entre sus clientes y su cuenta de Mercado Pago. A-commerr ERP no almacena tarjetas de crédito/débito ni retiene fondos de las transacciones.</p>
                                <p>**AFIP/ARCA (Plan Pro):** La automatización de facturación electrónica requiere que usted preocione e integre sus credenciales y puntos de venta fiscales. La veracidad y adecuación de las declaraciones fiscales son responsabilidad exclusiva de la Empresa registrante. A-commerr ERP actúa meramente como un canal de integración técnica con los webservices estatales.</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-black text-gray-800 text-base">4. Cargos, Suscripción y Recisión</h3>
                                <p>El servicio se factura de manera recurrente (mensual o anual) según el plan seleccionado. Usted puede rescindir la suscripción o solicitar la baja del servicio en cualquier momento desde el panel de administración, aplicando los efectos de la baja para el próximo período de facturación sin cargos adicionales de cancelación.</p>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, terminos_aceptados: true }));
                                    setShowTerms(false);
                                }}
                                className="bg-[#ff5b00] hover:bg-[#ef4c00] text-white px-8 py-3 rounded-2xl font-black transition-colors"
                            >
                                Aceptar y Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
