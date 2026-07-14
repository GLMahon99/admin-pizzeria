import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext'; // Import useTenant
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Lock, Hash, AlertCircle, ArrowRight, CheckCircle, Mail, Key, ChevronLeft } from 'lucide-react';

const Login = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
    const [credentials, setCredentials] = useState({ cuit: '', password: '' });
    const [forgotCuit, setForgotCuit] = useState('');
    const [resetData, setResetData] = useState({ code: '', newPassword: '', confirmPassword: '' });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');

    const { login } = useAuth();
    const { setTenant } = useTenant(); // Obtener setTenant
    const navigate = useNavigate();
    const location = useLocation();

    // Capturamos el mensaje de éxito si viene de registro
    const successMessage = location.state?.message;

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleForgotChange = (e) => {
        setForgotCuit(e.target.value);
        if (error) setError('');
    };

    const handleResetChange = (e) => {
        setResetData({ ...resetData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Nueva ruta de login para administradores de empresas
            const res = await api.post('/auth/company-login', credentials);

            // Guardamos el usuario y el token
            login(res.data.empresa, res.data.token);

            // Seteamos el tenant globalmente para actualizar colores y logo
            setTenant(res.data.empresa);

            // Navegamos al Dashboard
            navigate('/');
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.status === 'INACTIVE') {
                navigate(`/subscription-plans/${err.response.data.empresaId}`);
                return;
            }
            setError(err.response?.data?.message || 'Cuit o contraseña incorrectos. Revisá tus datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.post('/auth/company-forgot-password', { cuit: forgotCuit });
            setMaskedEmail(res.data.email);
            setSuccess(`Código enviado al email registrado: ${res.data.email}`);
            setMode('reset');
            // Guardamos el cuit en credentials para el siguiente paso
            setCredentials(prev => ({ ...prev, cuit: forgotCuit }));
        } catch (err) {
            setError(err.response?.data?.message || 'Error al solicitar el código. Verificá tu CUIT.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (resetData.newPassword !== resetData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/company-reset-password', {
                cuit: credentials.cuit,
                code: resetData.code,
                newPassword: resetData.newPassword
            });
            setSuccess('Contraseña restablecida con éxito. Ya podés iniciar sesión.');
            setMode('login');
            // Limpiamos los formularios
            setResetData({ code: '', newPassword: '', confirmPassword: '' });
            setForgotCuit('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña. Verificá el código.');
        } finally {
            setLoading(false);
        }
    };

    const changeMode = (newMode) => {
        setMode(newMode);
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Elementos decorativos animados */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-gold-200/40 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[5%] w-72 h-72 bg-red-200/40 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="mb-8 flex justify-center transform hover:scale-105 transition-transform duration-500">
                            <div className="flex items-center justify-center gap-2"><img src="/logo-acommerr.png" alt="A-commerr Logo" className="h-16 object-contain" /></div>
                        </div>

                        <p className="text-gray-500 font-medium mt-2 italic">
                            {mode === 'login' && 'Gestioná tu ecommerce en un solo lugar.'}
                            {mode === 'forgot' && 'Recuperá el acceso a tu cuenta comercial.'}
                            {mode === 'reset' && 'Crea una nueva contraseña de seguridad.'}
                        </p>
                    </div>

                    {/* Mensaje de Éxito Post-Registro */}
                    {successMessage && mode === 'login' && (
                        <div className="mb-6 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 flex items-center gap-3">
                            <CheckCircle size={20} className="shrink-0" />
                            <p className="text-xs font-bold">{successMessage}</p>
                        </div>
                    )}

                    {/* Mensaje de Éxito General */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 flex items-center gap-3">
                            <CheckCircle size={20} className="shrink-0" />
                            <p className="text-xs font-bold">{success}</p>
                        </div>
                    )}

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 flex items-center gap-3">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    )}

                    {/* MODO LOGIN */}
                    {mode === 'login' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* CUIT */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Identificador (CUIT)</label>
                                <div className="relative group">
                                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5b00] transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="cuit"
                                        required
                                        value={credentials.cuit}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-100/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400"
                                        placeholder="20-XXXXXXXX-X"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
                                    <button
                                        type="button"
                                        onClick={() => changeMode('forgot')}
                                        className="text-xs font-bold text-gray-400 hover:text-[#ff5b00] transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5b00] transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={credentials.password}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-100/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#ff5b00] hover:bg-[#083d5a] text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-gold-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Verificando...' : (
                                    <>
                                        Ingresar al Sistema <ArrowRight size={22} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* MODO FORGOT PASSWORD */}
                    {mode === 'forgot' && (
                        <form onSubmit={handleForgotSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Ingresá el CUIT de tu Empresa</label>
                                <div className="relative group">
                                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5b00] transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="forgotCuit"
                                        required
                                        value={forgotCuit}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-100/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400"
                                        placeholder="20-XXXXXXXX-X"
                                        onChange={handleForgotChange}
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400 font-medium px-2 leading-relaxed">
                                    Te enviaremos un código de validación al correo de contacto que registraste con tu cuenta.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#ff5b00] hover:bg-[#083d5a] text-white rounded-[1.5rem] font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Buscando...' : (
                                    <>
                                        Enviar Código <Mail size={22} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => changeMode('login')}
                                className="w-full py-3 text-sm text-gray-500 hover:text-gray-800 font-bold transition-colors flex items-center justify-center gap-1"
                            >
                                <ChevronLeft size={16} /> Volver al inicio de sesión
                            </button>
                        </form>
                    )}

                    {/* MODO RESET PASSWORD */}
                    {mode === 'reset' && (
                        <form onSubmit={handleResetSubmit} className="space-y-6">
                            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-gray-600 mb-2">
                                <p className="text-xs font-semibold leading-relaxed">
                                    Ingresá el código de 6 dígitos enviado a <strong className="text-gray-900">{maskedEmail}</strong>. El código expira en 5 minutos.
                                </p>
                            </div>

                            {/* Código OTP */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Código de Verificación</label>
                                <div className="relative group">
                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5b00] transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="code"
                                        required
                                        maxLength={6}
                                        value={resetData.code}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-100/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800 tracking-[0.2em] placeholder:tracking-normal placeholder:text-gray-400"
                                        placeholder="123456"
                                        onChange={handleResetChange}
                                    />
                                </div>
                            </div>

                            {/* Nueva Contraseña */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Nueva Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5b00] transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        required
                                        value={resetData.newPassword}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-100/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        onChange={handleResetChange}
                                    />
                                </div>
                            </div>

                            {/* Confirmar Nueva Contraseña */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Confirmar Nueva Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5b00] transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={resetData.confirmPassword}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-100/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-gold-500 ring-0 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        onChange={handleResetChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#ff5b00] hover:bg-[#083d5a] text-white rounded-[1.5rem] font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Restableciendo...' : (
                                    <>
                                        Restablecer Contraseña <CheckCircle size={22} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => changeMode('login')}
                                className="w-full py-3 text-sm text-gray-500 hover:text-gray-800 font-bold transition-colors flex items-center justify-center gap-1"
                            >
                                <ChevronLeft size={16} /> Volver al inicio de sesión
                            </button>
                        </form>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-4 items-center">
                        <p className="text-sm text-gray-500 font-medium">
                            ¿Aún no tenés tu comercio registrado?
                        </p>
                        <Link
                            to="/register"
                            className="bg-gray-900 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#ff5b00] transition-colors shadow-lg shadow-gray-200"
                        >
                            Registrar Empresa
                        </Link>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-2 opacity-30">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.5em] text-center">
                        Secure Enterprise Platform
                    </p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        v2.0 Build 2026-04
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;