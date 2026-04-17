import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
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
                // Si ya tenemos el token, tal vez el tenant ya esté identificado.
                // Pero si no, intentamos por URL como fallback.
                const hostname = window.location.hostname;
                const searchParams = new URLSearchParams(window.location.search);
                
                let slug = searchParams.get('tenant');

                if (!slug) {
                    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
                        // Omito el slug por defecto si prefiero que fuerce el login
                        setLoading(false);
                        return;
                    } else {
                        slug = hostname.split('.')[0];
                    }
                }

                if (slug) {
                    axios.defaults.headers.common['x-tenant'] = slug;
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/config`);
                    const config = response.data;
                    setTenantConfig(config);
                    applyBranding(config);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar la configuración del tenant:', err);
                // No bloqueamos el render si falla el automuestreo, permitimos el login centralizado
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <TenantContext.Provider value={{ tenantConfig, setTenant, loading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
