import { useState } from "react";
import Modal from "./Modal.jsx";

export default function ClientForm({ client, onSave, onClose }) {
  const editing = Boolean(client);
  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSave({ name: name.trim(), email: email.trim(), notes: notes.trim() });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? "Editar cliente" : "Novo cliente"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="cl-name">Nome completo</label>
          <input
            id="cl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: João Ferreira"
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="cl-email">Email</label>
          <input
            id="cl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@email.com"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="cl-notes">Observações (opcional)</label>
          <textarea
            id="cl-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Preferências de corte, alergias, etc."
            maxLength={500}
          />
        </div>

        <div className="modal__foot" style={{ padding: 0, marginTop: 8 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
