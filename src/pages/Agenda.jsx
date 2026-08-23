import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import { STATUSES } from "../statuses.js";
import AppointmentForm from "../components/AppointmentForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const PERIODS = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Próximos 7 dias" },
  { value: "todos", label: "Todos" },
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDayHeading(date) {
  const s = date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function Agenda() {
  const toast = useToast();
  const [appointments, setAppointments] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [period, setPeriod] = useState("semana");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function loadAll() {
    const [appts, cls, svcs] = await Promise.all([
      api.getAppointments(),
      api.getClients(),
      api.getServices(),
    ]);
    setAppointments(appts);
    setClients(cls);
    setServices(svcs);
  }

  useEffect(() => {
    loadAll().catch((err) => toast.show(err.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtra pelo período escolhido e agrupa por dia
  const groups = useMemo(() => {
    if (!appointments) return [];

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
  }, [appointments, period]);

  async function handleSave(data) {
    if (editing) {
      const updated = await api.updateAppointment(editing.id, data);
      setAppointments((list) => list.map((a) => (a.id === updated.id ? updated : a)).sort(bySchedule));
      toast.show("Agendamento atualizado.");
    } else {
      const created = await api.createAppointment(data);
      setAppointments((list) => [...list, created].sort(bySchedule));
      toast.show("Agendamento criado. O cliente receberá um e-mail de confirmação.");
    }
    setFormOpen(false);
    setEditing(null);
  }

  function bySchedule(a, b) {
    return new Date(a.scheduledAt) - new Date(b.scheduledAt);
  }

  async function handleStatusChange(appointment, status) {
    const previous = appointment.status;
    // Atualização otimista: a interface responde na hora
    setAppointments((list) =>
      list.map((a) => (a.id === appointment.id ? { ...a, status } : a))
    );
    try {
      await api.updateAppointmentStatus(appointment.id, status);
      const label = STATUSES.find((s) => s.value === status)?.label;
      toast.show(`Status alterado para "${label}".`);
    } catch (err) {
      setAppointments((list) =>
        list.map((a) => (a.id === appointment.id ? { ...a, status: previous } : a))
      );
      toast.show(err.message, "error");
    }
  }

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await api.deleteAppointment(deleting.id);
      setAppointments((list) => list.filter((a) => a.id !== deleting.id));
      toast.show("Agendamento removido.");
      setDeleting(null);
    } catch (err) {
      toast.show(err.message, "error");
    } finally {
      setDeleteBusy(false);
    }
  }

  if (!appointments) {
    return <div className="loading">Carregando a agenda...</div>;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Agenda</h2>
          <p className="sub">Os agendamentos organizados por data e horário.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Novo agendamento
        </button>
      </div>

      <div className="toolbar">
        <div className="seg" role="tablist">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={period === p.value ? "active" : ""}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="empty">
          <span className="empty__icon">💈</span>
          <h4>Nenhum agendamento por aqui</h4>
          <p>
            {period === "todos"
              ? "Clique em “Novo agendamento” para marcar o primeiro horário."
              : "Nada marcado para este período. Troque o filtro ou crie um novo agendamento."}
          </p>
        </div>
      )}

      {groups.map((group) => (
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
              </div>
              <div className="appt__status">
                <select
                  className={`status-select status-select--${a.status}`}
                  value={a.status}
                  onChange={(e) => handleStatusChange(a, e.target.value)}
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
                <button
                  className="icon-btn"
                  title="Editar agendamento"
                  onClick={() => {
                    setEditing(a);
                    setFormOpen(true);
                  }}
                >
                  ✎
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  title="Remover agendamento"
                  onClick={() => setDeleting(a)}
                >
                  🗑
                </button>
              </div>
            </article>
          ))}
        </section>
      ))}

      {formOpen && clients.length === 0 && (
        <ConfirmDialog
          title="Cadastre um cliente primeiro"
          message={
            <>
              Todo agendamento precisa estar vinculado a um cliente.{" "}
              <Link to="/clientes">Vá para a aba Clientes</Link> e cadastre o primeiro.
            </>
          }
          confirmLabel="Entendi"
          onConfirm={() => setFormOpen(false)}
          onClose={() => setFormOpen(false)}
        />
      )}

      {formOpen && clients.length > 0 && (
        <AppointmentForm
          appointment={editing}
          clients={clients}
          services={services}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Remover agendamento"
          message={
            <>
              Remover o agendamento de <strong>{deleting.client.name}</strong> (
              {deleting.service.name}) em {formatDayHeading(new Date(deleting.scheduledAt))} às{" "}
              {formatTime(deleting.scheduledAt)}? Essa ação não pode ser desfeita.
            </>
          }
          confirmLabel="Remover"
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
          busy={deleteBusy}
        />
      )}
    </div>
  );
}
