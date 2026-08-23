import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Login from "./pages/Login.jsx";
import Agenda from "./pages/Agenda.jsx";
import Clients from "./pages/Clients.jsx";
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
      <Route path="/login" element={user ? <Navigate to="/agenda" replace /> : <Login />} />
      <Route path="/agenda" element={<Protected user={user}><Agenda /></Protected>} />
      <Route path="/clientes" element={<Protected user={user}><Clients /></Protected>} />
      <Route path="*" element={<Navigate to="/agenda" replace />} />
    </Routes>
  );
}
