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

// Interceptor para inyectar el token y el tenant automáticamente (soporta admin y repartidor)
api.interceptors.request.use((config) => {
    const isRepartidorPath = window.location.pathname.includes('/reparto');
    const repartidorToken = localStorage.getItem('repartidor_token');
    const adminToken = localStorage.getItem('admin_token');

    if (isRepartidorPath && repartidorToken) {
        config.headers.Authorization = `Bearer ${repartidorToken}`;
    } else if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    }

    const repartidorTenant = localStorage.getItem('repartidor_tenant_slug');
    const userJson = localStorage.getItem('admin_user');

    if (isRepartidorPath && repartidorTenant) {
        config.headers['x-tenant'] = repartidorTenant;
    } else if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user.slug) {
                config.headers['x-tenant'] = user.slug;
            }
        } catch (e) {
            console.error("Error al parsear admin_user:", e);
        }
    }

    return config;
});

export default api;