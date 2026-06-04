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

// Interceptor para manejar respuestas de error (ej. token JWT expirado o inválido)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isRepartidorPath = window.location.pathname.includes('/reparto');

            if (isRepartidorPath) {
                // Limpiar credenciales de repartidor
                localStorage.removeItem('repartidor_token');
                localStorage.removeItem('repartidor_user');
                localStorage.removeItem('repartidor_tenant_slug');

                // Si no estamos en la página de reparto, redirigir
                if (!window.location.pathname.endsWith('/reparto')) {
                    window.location.href = '/reparto';
                }
            } else {
                // Limpiar credenciales de administrador de comercio
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');

                // Si no estamos en la página de login, redirigir
                if (!window.location.pathname.endsWith('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;