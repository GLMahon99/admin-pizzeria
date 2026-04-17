import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTenant } from './context/TenantContext';

// Importamos tus páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Layout from './components/Layout';
import Supplies from './pages/Supplies';
import Settings from './pages/Settings';

function App() {
  const { token, loading: authLoading } = useAuth();
  const { loading: tenantLoading, error: tenantError } = useTenant();

  if (authLoading || tenantLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (tenantError) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>{tenantError}</p>
      </div>
    );
  }

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
