import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
    const [tenantConfig, setTenantConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // 1. Obtener el slug del subdominio o de la URL
                const hostname = window.location.hostname;
                const searchParams = new URLSearchParams(window.location.search);
                
                let slug = searchParams.get('tenant'); // Prioridad si viene por query (útil para testing)

                if (!slug) {
                    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
                        slug = 'pizzeria-la-nona'; // Slug por defecto para desarrollo local
                    } else {
                        // Ejemplo: slug.admin-pizzeria.com -> slug
                        slug = hostname.split('.')[0];
                    }
                }

                console.log('--- Identificando Tenant ---');
                console.log('Hostname:', hostname);
                console.log('Slug detectado:', slug);

                // 2. Configurar axios para que incluya siempre el tenant en los headers
                axios.defaults.headers.common['x-tenant'] = slug;
                
                // 3. Obtener la configuración de la empresa
                // Usamos la ruta que creamos en el backend
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/config`, {
                    headers: { 'x-tenant': slug } // Asegurarnos de enviarlo en esta petición también
                });

                const config = response.data;
                setTenantConfig(config);

                // 4. Inyectar estilos globales basados en la configuración
                applyBranding(config);

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar la configuración del tenant:', err);
                setError('No se pudo identificar la pizzería.');
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

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

    return (
        <TenantContext.Provider value={{ tenantConfig, loading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
