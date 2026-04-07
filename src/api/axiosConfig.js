import axios from 'axios';

// Creamos una instancia personalizada de Axios
const api = axios.create({
    // Acá va la URL de tu backend en Railway
    // Usamos una variable de entorno de Vite (VITE_) para que sea fácil de cambiar
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el token automáticamente si existe en el localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;