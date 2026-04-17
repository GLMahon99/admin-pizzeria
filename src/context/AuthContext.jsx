import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('admin_user')) || null);
    const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
    const [loading, setLoading] = useState(true);

    // Configuramos Axios para que SIEMPRE use el token si existe
    useEffect(() => {
        if (token) {
            localStorage.setItem('admin_token', token);
            if (user) {
                localStorage.setItem('admin_user', JSON.stringify(user));
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token, user]);

    const login = (userData, userToken) => {
        localStorage.setItem('admin_user', JSON.stringify(userData));
        localStorage.setItem('admin_token', userToken);
        setUser(userData);
        setToken(userToken);
    };

    const logout = () => {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
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