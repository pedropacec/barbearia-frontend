import { NavLink } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/agenda" className="topbar__brand">
            Barbearia <em>Vintage</em>
          </NavLink>
          <nav className="topbar__nav">
            <NavLink to="/agenda">Agenda</NavLink>
            <NavLink to="/clientes">Clientes</NavLink>
          </nav>
          <div className="topbar__user">
            <span className="user-name">
              Olá, <strong>{user.name.split(" ")[0]}</strong>
            </span>
            <button className="btn btn--ghost" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>
      <div className="pole-stripe" />
      <main>{children}</main>
    </>
  );
}
