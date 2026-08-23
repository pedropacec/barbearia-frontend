import Modal from "./Modal.jsx";

// Confirmação antes de ações destrutivas — remoções não têm volta.
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose, busy }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Removendo..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className="confirm-text">{message}</p>
    </Modal>
  );
}
