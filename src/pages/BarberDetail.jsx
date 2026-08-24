import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import { STATUSES } from "../statuses.js";
import AppointmentDayGroups, {
  PERIODS,
  groupAppointments,
  formatDayHeading,
  formatTime,
} from "../components/AppointmentDayGroups.jsx";
import AppointmentForm from "../components/AppointmentForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// Página individual do profissional: a agenda dele, com os mesmos
// controles da agenda geral
export default function BarberDetail() {
  const { id } = useParams();
  const barberId = Number(id);
  const toast = useToast();

  const [barber, setBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [period, setPeriod] = useState("semana");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([api.getBarbers(), api.getAppointments(barberId), api.getClients(), api.getServices()])
      .then(([brbs, appts, cls, svcs]) => {
        const found = brbs.find((b) => b.id === barberId);
        if (!found) {
          setNotFound(true);
          return;
        }
        setBarber(found);
        setBarbers(brbs);
        setAppointments(appts);
        setClients(cls);
        setServices(svcs);
      })
      .catch((err) => toast.show(err.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId]);

  const groups = useMemo(
    () => (appointments ? groupAppointments(appointments, period) : []),
    [appointments, period]
  );

  const stats = useMemo(() => {
    if (!appointments) return null;
    const ativos = appointments.filter((a) => a.status === "agendado").length;
    const concluidos = appointments.filter((a) => a.status === "concluido").length;
    return { ativos, concluidos };
  }, [appointments]);

  function bySchedule(a, b) {
    return new Date(a.scheduledAt) - new Date(b.scheduledAt);
  }

  async function handleSave(data) {
    if (editing) {
      const updated = await api.updateAppointment(editing.id, data);
      setAppointments((list) => {
        // Se o agendamento foi movido para outro profissional, sai desta página
        const next = updated.barber?.id === barberId
          ? list.map((a) => (a.id === updated.id ? updated : a))
          : list.filter((a) => a.id !== updated.id);
        return next.sort(bySchedule);
      });
      toast.show("Agendamento atualizado.");
    } else {
      const created = await api.createAppointment(data);
      if (created.barber?.id === barberId) {
        setAppointments((list) => [...list, created].sort(bySchedule));
      }
      toast.show("Agendamento criado. O cliente receberá um e-mail de confirmação.");
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleStatusChange(appointment, status) {
    const previous = appointment.status;
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

  if (notFound) {
    return (
      <div className="page">
        <div className="empty">
          <span className="empty__icon">💈</span>
          <h4>Profissional não encontrado</h4>
          <p>
            <Link to="/profissionais">Voltar para a lista de profissionais</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!barber || !appointments) {
    return <div className="loading">Carregando a agenda do profissional...</div>;
  }

  return (
    <div className="page">
      <p className="crumb">
        <Link to="/profissionais">← Todos os profissionais</Link>
      </p>

      <div className="page-head barber-head">
        <div className="barber-head__id">
          <div className="client-card__monogram barber-head__monogram" aria-hidden="true">
            {initials(barber.name)}
          </div>
          <div>
            <h2>{barber.name}</h2>
            <p className="sub">
              Atende {barber.schedule} · {stats.ativos}{" "}
              {stats.ativos === 1 ? "agendamento ativo" : "agendamentos ativos"} ·{" "}
              {stats.concluidos} {stats.concluidos === 1 ? "concluído" : "concluídos"}
            </p>
          </div>
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
          <span className="empty__icon">✂️</span>
          <h4>Nada na agenda de {barber.name.split(" ")[0]}</h4>
          <p>Nenhum agendamento neste período. Troque o filtro ou crie um novo.</p>
        </div>
      )}

      <AppointmentDayGroups
        groups={groups}
        onStatusChange={handleStatusChange}
        onEdit={(a) => {
          setEditing(a);
          setFormOpen(true);
        }}
        onDelete={setDeleting}
        showBarber={false}
      />

      {formOpen && (
        <AppointmentForm
          appointment={editing}
          clients={clients}
          services={services}
          barbers={barbers}
          defaultBarberId={barberId}
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
