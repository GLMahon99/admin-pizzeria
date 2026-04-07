import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
    // Cambiala temporalmente por esta:
    const [token, setToken] = useState('token-de-prueba-para-diseno');
    const [loading, setLoading] = useState(true);

    // Configuramos Axios para que SIEMPRE use el token si existe
    useEffect(() => {
        if (token) {
            localStorage.setItem('admin_token', token);
            // "Inyectamos" el token en las cabeceras de todas las peticiones futuras
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('admin_token');
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto más fácil
export const useAuth = () => useContext(AuthContext);