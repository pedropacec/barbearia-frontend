import { useState } from "react";
import Modal from "./Modal.jsx";

// Converte um Date para os valores dos inputs de data e hora
function toDateInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Sugestão inicial: próxima meia hora cheia
function nextHalfHour() {
  const d = new Date();
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return d;
}

export default function AppointmentForm({ appointment, clients, services, onSave, onClose }) {
  const editing = Boolean(appointment);
  const initial = editing ? new Date(appointment.scheduledAt) : nextHalfHour();

  const [clientId, setClientId] = useState(appointment?.client.id ?? "");
  const [serviceId, setServiceId] = useState(appointment?.service.id ?? "");
  const [date, setDate] = useState(toDateInput(initial));
  const [time, setTime] = useState(toTimeInput(initial));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!clientId) return setError("Selecione o cliente.");
    if (!serviceId) return setError("Selecione o serviço.");
    if (!date || !time) return setError("Informe a data e o horário.");

    setBusy(true);
    try {
      // Data e hora locais viram um instante único (ISO) para a API
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      await onSave({ clientId: Number(clientId), serviceId: Number(serviceId), scheduledAt });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? "Editar agendamento" : "Novo agendamento"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="ap-client">Cliente</label>
          <select
            id="ap-client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            autoFocus={!editing}
          >
            <option value="">Selecione o cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="ap-service">Serviço</label>
          <select id="ap-service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Selecione o serviço...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="ap-date">Data</label>
            <input id="ap-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ap-time">Horário</label>
            <input
              id="ap-time"
              type="time"
              step="900"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="modal__foot" style={{ padding: 0, marginTop: 8 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? "Salvando..." : editing ? "Salvar alterações" : "Agendar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
