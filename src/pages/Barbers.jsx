import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// Lista dos profissionais da casa — cada ficha leva à página individual
export default function Barbers() {
  const toast = useToast();
  const [barbers, setBarbers] = useState(null);
  const [activeCount, setActiveCount] = useState({});

  useEffect(() => {
    Promise.all([api.getBarbers(), api.getAppointments()])
      .then(([brbs, appts]) => {
        setBarbers(brbs);
        const counts = {};
        for (const a of appts) {
          if (a.status === "agendado" && a.barber) {
            counts[a.barber.id] = (counts[a.barber.id] || 0) + 1;
          }
        }
        setActiveCount(counts);
      })
      .catch((err) => toast.show(err.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!barbers) {
    return <div className="loading">Carregando os profissionais...</div>;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Profissionais</h2>
          <p className="sub">
            {barbers.length} profissionais na casa. Clique em um para ver a agenda dele.
          </p>
        </div>
      </div>

      <div className="client-grid">
        {barbers.map((b, i) => {
          const count = activeCount[b.id] || 0;
          return (
            <Link
              to={`/profissionais/${b.id}`}
              className="client-card barber-card"
              key={b.id}
              style={{ animationDelay: `${Math.min(i * 45, 270)}ms` }}
            >
              <header className="client-card__top">
                <div className="client-card__monogram" aria-hidden="true">
                  {initials(b.name)}
                </div>
                <span className="client-card__number">Nº {String(b.id).padStart(2, "0")}</span>
              </header>

              <h3 className="client-card__name">{b.name}</h3>
              <p className="client-card__email">{b.schedule}</p>

              <footer className="client-card__foot">
                <span className="client-card__visits">
                  ✂ {count} {count === 1 ? "agendamento ativo" : "agendamentos ativos"}
                </span>
                <span className="barber-card__go">Abrir agenda →</span>
              </footer>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
