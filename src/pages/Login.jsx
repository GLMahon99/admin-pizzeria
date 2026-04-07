import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Lock, User, Pizza, AlertCircle } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError(''); // Limpiamos el error mientras escribe
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Llamada al backend (Asegurate de tener esta ruta en tu Node.js)
            const res = await api.post('/auth/login-admin', credentials);

            // Si el backend devuelve el token y los datos del admin:
            login(res.data.user, res.data.token);
            navigate('/'); // Nos vamos al Dashboard
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas. Intentalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100">

                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full text-white mb-4 shadow-lg">
                        <Pizza size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
                    <p className="text-gray-500">Ingresá tus credenciales de administrador</p>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 animate-pulse">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email del Admin</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <User size={18} />
                            </span>
                            <input
                                type="email"
                                name="email"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                                placeholder="admin@pizzeria.com"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                name="password"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold transition shadow-md ${loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:transform active:scale-95'
                            }`}
                    >
                        {loading ? 'Validando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
                    Florida, Buenos Aires - 2026
                </p>
            </div>
        </div>
    );
};

export default Login;