import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Login from "./pages/Login.jsx";
import Agenda from "./pages/Agenda.jsx";
import Clients from "./pages/Clients.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  const { user } = useAuth();

  // Sem login, qualquer rota cai na tela de entrada
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/agenda" replace />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="*" element={<Navigate to="/agenda" replace />} />
      </Routes>
    </Layout>
  );
}
