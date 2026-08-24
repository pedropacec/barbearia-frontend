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
  const [barbers, setBarbers] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
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
    publicApi.getBarbers().then(setBarbers).catch(() => setBarbers([]));
  }, []);

  // Horários dependem do profissional + dia escolhidos
  useEffect(() => {
    setSlot("");
    if (!barberId) {
      setAvailability(undefined); // undefined = aguardando escolha do profissional
      return;
    }
    setAvailability(null);
    publicApi
      .getAvailability(date, barberId)
      .then(setAvailability)
      .catch(() => setAvailability({ open: false, slots: [] }));
  }, [date, barberId]);

  // Se o dia atual não tem horário para o profissional (ex.: folga dele),
  // avança automaticamente para o próximo dia em que ele atende
  const [autoAdvancedFor, setAutoAdvancedFor] = useState("");
  useEffect(() => {
    if (!barberId || availability === null || availability === undefined) return;
    if (autoAdvancedFor === barberId) return;
    setAutoAdvancedFor(barberId);
    if (!availability.open || availability.slots.length === 0) {
      const findNext = async () => {
        const d = new Date(`${date}T12:00:00`);
        for (let i = 1; i <= 7; i++) {
          d.setDate(d.getDate() + 1);
          if (d.getDay() === 0 || d.getDay() === 1) continue;
          const probe = toDateInput(d);
          try {
            const av = await publicApi.getAvailability(probe, barberId);
            if (av.open && av.slots.length > 0) {
              setDate(probe);
              return;
            }
          } catch {
            return;
          }
        }
      };
      findNext();
    }
  }, [availability, autoAdvancedFor, barberId, date]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!serviceId) return setError("Escolha o serviço.");
    if (!barberId) return setError("Escolha o profissional.");
    if (!slot) return setError("Escolha um horário disponível.");
    if (!name.trim() || !email.trim()) return setError("Preencha seu nome e email.");

    setBusy(true);
    try {
      await publicApi.createBooking({
        name: name.trim(),
        email: email.trim(),
        serviceId: Number(serviceId),
        barberId: Number(barberId),
        scheduledAt: slot,
      });
      const chosen = availability.slots.find((s) => s.iso === slot);
      setDone({
        service: services.find((s) => s.id === Number(serviceId))?.name,
        barber: barbers.find((b) => b.id === Number(barberId))?.name,
        date: formatLongDate(date),
        time: chosen?.label,
        email: email.trim(),
      });
    } catch (err) {
      setError(err.message);
      // O horário pode ter sido ocupado enquanto o cliente escolhia
      publicApi.getAvailability(date, barberId).then(setAvailability).catch(() => {});
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
          <strong>{done.service}</strong> com <strong>{done.barber}</strong>
          <br />
          {done.date} às <strong>{done.time}</strong>
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
            publicApi.getAvailability(date, barberId).then(setAvailability).catch(() => {});
          }}
        >
          Fazer outro agendamento
        </button>
      </div>
    );
  }

  const selectedBarber = barbers.find((b) => b.id === Number(barberId));

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
          <label htmlFor="bk-barber">Profissional</label>
          <select id="bk-barber" value={barberId} onChange={(e) => setBarberId(e.target.value)}>
            <option value="">Escolha o profissional...</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBarber && (
        <p className="booking__schedule">
          {selectedBarber.name} atende {selectedBarber.schedule}.
        </p>
      )}

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

      <div className="field">
        <label>Horários disponíveis · {formatLongDate(date)}</label>
        {availability === undefined && (
          <p className="booking__hint">Escolha o profissional para ver os horários.</p>
        )}
        {availability === null && <p className="booking__hint">Carregando horários...</p>}
        {availability && !availability.open && (
          <p className="booking__hint">
            {selectedBarber ? `${selectedBarber.name} não atende neste dia.` : "Fechado neste dia."}{" "}
            Escolha outra data.
          </p>
        )}
        {availability && availability.open && availability.slots.length === 0 && (
          <p className="booking__hint">Sem horários livres neste dia. Tente outra data.</p>
        )}
        {availability && availability.open && availability.slots.length > 0 && (
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
