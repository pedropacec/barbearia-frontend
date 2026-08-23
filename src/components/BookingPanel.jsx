import { useEffect, useState } from "react";
import { publicApi } from "../api.js";

function toDateInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Primeiro dia aberto a partir de hoje (fechamos domingo e segunda)
function nextOpenDay() {
  const d = new Date();
  while (d.getDay() === 0 || d.getDay() === 1) d.setDate(d.getDate() + 1);
  return d;
}

function formatLongDate(dateStr) {
  const s = new Date(`${dateStr}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BookingPanel() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(toDateInput(nextOpenDay()));
  const [availability, setAvailability] = useState(null); // null = carregando
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    publicApi.getServices().then(setServices).catch(() => setServices([]));
  }, []);

  useEffect(() => {
    setAvailability(null);
    setSlot("");
    publicApi
      .getAvailability(date)
      .then(setAvailability)
      .catch(() => setAvailability({ open: false, slots: [] }));
  }, [date]);

  // Se hoje já não tem horário livre (ex.: fim do expediente), o painel
  // abre direto no próximo dia com horários — o cliente não cai no vazio
  const [autoAdvanced, setAutoAdvanced] = useState(false);
  useEffect(() => {
    if (autoAdvanced || availability === null) return;
    setAutoAdvanced(true);
    const today = toDateInput(new Date());
    if (date === today && (!availability.open || availability.slots.length === 0)) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      while (d.getDay() === 0 || d.getDay() === 1) d.setDate(d.getDate() + 1);
      setDate(toDateInput(d));
    }
  }, [availability, autoAdvanced, date]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!serviceId) return setError("Escolha o serviço.");
    if (!slot) return setError("Escolha um horário disponível.");
    if (!name.trim() || !email.trim()) return setError("Preencha seu nome e email.");

    setBusy(true);
    try {
      await publicApi.createBooking({
        name: name.trim(),
        email: email.trim(),
        serviceId: Number(serviceId),
        scheduledAt: slot,
      });
      const chosen = availability.slots.find((s) => s.iso === slot);
      setDone({
        service: services.find((s) => s.id === Number(serviceId))?.name,
        date: formatLongDate(date),
        time: chosen?.label,
        email: email.trim(),
      });
    } catch (err) {
      setError(err.message);
      // O horário pode ter sido ocupado enquanto o cliente escolhia
      publicApi.getAvailability(date).then(setAvailability).catch(() => {});
      setSlot("");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="booking booking--done">
        <span className="booking-done__mark">✓</span>
        <h3>Horário confirmado</h3>
        <p>
          <strong>{done.service}</strong> · {done.date} às <strong>{done.time}</strong>
        </p>
        <p className="booking-done__note">
          Enviamos a confirmação para <strong>{done.email}</strong>. Se precisar remarcar, fale com
          a gente pelo WhatsApp.
        </p>
        <button
          className="btn btn--ghost"
          onClick={() => {
            setDone(null);
            setSlot("");
            publicApi.getAvailability(date).then(setAvailability).catch(() => {});
          }}
        >
          Fazer outro agendamento
        </button>
      </div>
    );
  }

  return (
    <form className="booking" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="field-row">
        <div className="field">
          <label htmlFor="bk-service">Serviço</label>
          <select id="bk-service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Escolha o serviço...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="bk-date">Dia</label>
          <input
            id="bk-date"
            type="date"
            value={date}
            min={toDateInput(new Date())}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label>Horários disponíveis · {formatLongDate(date)}</label>
        {availability === null && <p className="booking__hint">Carregando horários...</p>}
        {availability !== null && !availability.open && (
          <p className="booking__hint">
            Não abrimos neste dia (fechamos domingo e segunda). Escolha outra data.
          </p>
        )}
        {availability !== null && availability.open && availability.slots.length === 0 && (
          <p className="booking__hint">Sem horários livres neste dia. Tente outra data.</p>
        )}
        {availability !== null && availability.slots.length > 0 && (
          <div className="slot-grid">
            {availability.slots.map((s) => (
              <button
                type="button"
                key={s.iso}
                className={`slot ${slot === s.iso ? "slot--on" : ""}`}
                onClick={() => setSlot(s.iso)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="bk-name">Seu nome</label>
          <input
            id="bk-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome e sobrenome"
          />
        </div>
        <div className="field">
          <label htmlFor="bk-email">Seu email</label>
          <input
            id="bk-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </div>
      </div>

      <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
        {busy ? "Confirmando..." : "Confirmar agendamento"}
      </button>
      <p className="booking__hint booking__hint--center">
        Você recebe a confirmação por e-mail assim que o horário é reservado.
      </p>
    </form>
  );
}
