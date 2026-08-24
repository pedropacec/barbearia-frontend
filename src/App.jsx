import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Agenda from "./pages/Agenda.jsx";
import Clients from "./pages/Clients.jsx";
import Barbers from "./pages/Barbers.jsx";
import BarberDetail from "./pages/BarberDetail.jsx";
import Layout from "./components/Layout.jsx";

// Rota interna: exige funcionário autenticado
function Protected({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Página pública da barbearia (vista pelo cliente) */}
      <Route path="/" element={<Landing />} />

      {/* Entrada do sistema interno */}
      <Route path="/login" element={user ? <Navigate to="/agenda" replace /> : <Login />} />

      {/* Sistema interno (funcionários) */}
      <Route path="/agenda" element={<Protected user={user}><Agenda /></Protected>} />
      <Route path="/clientes" element={<Protected user={user}><Clients /></Protected>} />
      <Route path="/profissionais" element={<Protected user={user}><Barbers /></Protected>} />
      <Route path="/profissionais/:id" element={<Protected user={user}><BarberDetail /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
