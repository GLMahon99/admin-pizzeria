import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTenant } from './context/TenantContext';

// Importamos tus páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Layout from './components/Layout';
import Supplies from './pages/Supplies';
import Settings from './pages/Settings';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionSuccess from './pages/SubscriptionSuccess';

function App() {
  const { token, loading: authLoading } = useAuth();
  const { loading: tenantLoading, error: tenantError } = useTenant();

  // NOTA: Para el login centralizado, tal vez no queremos bloquear por tenantError antes de loguear
  // Pero lo dejamos así por ahora si el tenant se detecta por URL.
  // Sin embargo, si el login es GLOBAL, el tenantError no debería bloquear la página de login.

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Rutas públicas: Login y Registro */}
        <Route path="login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="register" element={!token ? <Register /> : <Navigate to="/" />} />
        <Route path="subscription-plans/:companyId" element={<SubscriptionPlans />} />
        <Route path="subscription-success" element={<SubscriptionSuccess />} />

        {/* Rutas privadas: Todo lo que esté dentro de Layout requiere Token */}
        <Route path="/" element={!token ? <Landing /> : <Layout />}>
          {token && (
            <>
              <Route index element={<Dashboard />} />
              <Route path="pedidos" element={<Orders />} />
              <Route path="inventario" element={<Inventory />} />
              <Route path="insumos" element={<Supplies />} />
              <Route path="configuracion" element={<Settings />} />
            </>
          )}
        </Route>

        {/* Redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
