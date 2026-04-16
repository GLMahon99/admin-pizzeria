// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importamos tus páginas (las que iremos creando)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Layout from './components/Layout';
import Supplies from './pages/Supplies';
import Settings from './pages/Settings';

function App() {
  const { token, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  return (
    <Router>
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

        {/* Rutas privadas: Todo lo que esté dentro de Layout requiere Token */}
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="inventario" element={<Inventory />} />
          <Route path="insumos" element={<Supplies />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>

        {/* Redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
