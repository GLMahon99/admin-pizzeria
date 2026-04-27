import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Importar AuthContext

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
    const { user } = useAuth(); // Obtener el usuario logueado (la empresa)
    const [tenantConfig, setTenantConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const applyBranding = (config) => {
        if (!config) return;

        const root = document.documentElement;
        
        // Colores
        if (config.color_primario) root.style.setProperty('--color-primary', config.color_primario);
        if (config.color_secundario) root.style.setProperty('--color-secondary', config.color_secundario);
        if (config.color_terciario) root.style.setProperty('--color-tertiary', config.color_terciario);

        // Título de la página
        if (config.nombre) document.title = `Admin - ${config.nombre}`;
    };

    // Método para setear el tenant manualmente tras el login
    const setTenant = (config) => {
        setTenantConfig(config);
        applyBranding(config);
        if (config.slug) {
            axios.defaults.headers.common['x-tenant'] = config.slug;
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // 1. Prioridad: Si el usuario ya está logueado, usamos su data
                if (user && user.slug) {
                    setTenant(user);
                    setLoading(false);
                    return;
                }

                // 2. Fallback: Intentar por URL (para rutas públicas o antes del login)
                const hostname = window.location.hostname;
                const searchParams = new URLSearchParams(window.location.search);
                
                let slug = searchParams.get('tenant');

                if (!slug) {
                    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
                        setLoading(false);
                        return;
                    } else {
                        slug = hostname.split('.')[0];
                    }
                }

                if (slug) {
                    try {
                        axios.defaults.headers.common['x-tenant'] = slug;
                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/config`);
                        const config = response.data;
                        setTenantConfig(config);
                        applyBranding(config);
                    } catch (err) {
                        // Si da 404 es normal en el dominio principal de administración
                        if (err.response?.status !== 404) {
                            console.error('Error al cargar la configuración del tenant:', err);
                        }
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error crítico en fetchConfig:', err);
                setLoading(false);
            }
        };

        fetchConfig();
    }, [user]); // Re-ejecutar si el usuario cambia (ej: tras login)

    return (
        <TenantContext.Provider value={{ tenantConfig, setTenant, loading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
