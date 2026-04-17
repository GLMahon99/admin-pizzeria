import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Lock, Building, Pizza, AlertCircle, Hash, ArrowRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ 
        nombre: '', 
        cuit: '', 
        slug: '',
        email_contacto: '', // Nuevo campo
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            await api.post('/auth/register-company', formData);
            // Redirigir al login tras registro exitoso
            navigate('/login', { state: { message: '¡Registro exitoso! Ya podés iniciar sesión.' } });
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
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-md w-full relative">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl text-white mb-6 shadow-xl transform rotate-3">
                            <Pizza size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sumá tu <span className="text-orange-600">Pizzería</span></h1>
                        <p className="text-gray-500 mt-2 font-medium">Unite a la red más grande de pizzerías online.</p>
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
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 ring-0 outline-none transition-all font-bold text-gray-800"
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
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 ring-0 outline-none transition-all font-bold text-gray-800"
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
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 ring-0 outline-none transition-all font-bold text-gray-800"
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
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 ring-0 outline-none transition-all font-bold text-gray-800"
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
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 ring-0 outline-none transition-all font-bold text-gray-800"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl font-black shadow-xl shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Creando Empresa...' : (
                                <>
                                    Registrar Mi Pizzería <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            ¿Ya tenés una cuenta?{' '}
                            <Link to="/login" className="text-orange-600 font-black hover:underline underline-offset-4">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                    OMNIBUSINESS PRO - PLATAFORMA MULTI-TENANT
                </p>
            </div>
        </div>
    );
};

export default Register;
