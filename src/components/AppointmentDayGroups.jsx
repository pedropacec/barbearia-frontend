import { Link } from "react-router-dom";
import { STATUSES } from "../statuses.js";

// Agrupamento e renderização da agenda por dia — usado tanto na agenda
// geral quanto na página individual de cada profissional.

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatDayHeading(date) {
  const s = date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const PERIODS = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Próximos 7 dias" },
  { value: "todos", label: "Todos" },
];

export function groupAppointments(appointments, period) {
  const today = startOfDay(new Date());
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const filtered = appointments.filter((a) => {
    const day = startOfDay(new Date(a.scheduledAt));
    if (period === "hoje") return day.getTime() === today.getTime();
    if (period === "semana") return day >= today && day < weekEnd;
    return true;
  });

  const byDay = new Map();
  for (const a of filtered) {
    const key = startOfDay(new Date(a.scheduledAt)).getTime();
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(a);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, list]) => ({
      date: new Date(key),
      isToday: key === today.getTime(),
      appointments: list,
    }));
}

export default function AppointmentDayGroups({
  groups,
  onStatusChange,
  onEdit,
  onDelete,
  showBarber = true,
}) {
  return groups.map((group) => (
    <section className="day-group" key={group.date.getTime()}>
      <div className="day-group__head">
        <h3>
          {formatDayHeading(group.date)}
          {group.isToday && <span className="today-tag">Hoje</span>}
        </h3>
        <div className="rule" />
        <span className="count">
          {group.appointments.length}{" "}
          {group.appointments.length === 1 ? "atendimento" : "atendimentos"}
        </span>
      </div>

      {group.appointments.map((a) => (
        <article
          key={a.id}
          className={`appt ${
            a.status === "cancelado" || a.status === "nao_compareceu" ? "appt--muted" : ""
          }`}
        >
          <div className="appt__time">{formatTime(a.scheduledAt)}</div>
          <div className="appt__who">
            <strong>{a.client.name}</strong>
            <span>{a.service.name}</span>
            {showBarber && a.barber && (
              <Link className="appt__barber" to={`/profissionais/${a.barber.id}`} title="Abrir página do profissional">
                ✂ {a.barber.name}
              </Link>
            )}
          </div>
          <div className="appt__status">
            <select
              className={`status-select status-select--${a.status}`}
              value={a.status}
              onChange={(e) => onStatusChange(a, e.target.value)}
              aria-label={`Status do agendamento de ${a.client.name}`}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="appt__actions">
            <button className="icon-btn" title="Editar agendamento" onClick={() => onEdit(a)}>
              ✎
            </button>
            <button
              className="icon-btn icon-btn--danger"
              title="Remover agendamento"
              onClick={() => onDelete(a)}
            >
              🗑
            </button>
          </div>
        </article>
      ))}
    </section>
  ));
}
