import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { ShieldCheck, Mail, Lock, ArrowRight, Store, AlertCircle, Sparkles } from 'lucide-react';

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/superadmin/login', {
                email,
                password
            });

            const { token, admin } = response.data;

            // Guardar sesión exclusiva de Super Admin
            localStorage.setItem('superadmin_token', token);
            localStorage.setItem('superadmin_user', JSON.stringify(admin));

            navigate('/superadmin');
        } catch (err) {
            console.error('Error en SuperAdminLogin:', err);
            setError(err.response?.data?.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-gold-600 to-amber-400 rounded-2xl flex items-center justify-center shadow-xl shadow-gold-500/20 border border-gold-400/30">
                        <ShieldCheck className="text-slate-950 w-9 h-9" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-black text-white tracking-tight">
                    Acommerr <span className="text-gold-500">Master</span>
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Panel de Control de la Plataforma • Acceso Super Administrador
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-800">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ej: gastonmahon99@gmail.com"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Contraseña Maestra
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                            >
                                {loading ? (
                                    <span>Verificando credenciales...</span>
                                ) : (
                                    <>
                                        <span>Entrar al Panel Maestro</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col items-center gap-3">
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-xs text-slate-400 hover:text-gold-400 transition-colors"
                        >
                            <Store className="w-4 h-4" />
                            <span>¿Eres administrador de un local? Ir a Login de Comercios</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" /> Acommerr Platform Management System • 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
