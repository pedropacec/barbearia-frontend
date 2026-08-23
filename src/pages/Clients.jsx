import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import ClientForm from "../components/ClientForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function Clients() {
  const toast = useToast();
  const [clients, setClients] = useState(null);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    api
      .getClients()
      .then(setClients)
      .catch((err) => toast.show(err.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!clients) return [];
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [clients, query]);

  async function handleSave(data) {
    if (editing) {
      const updated = await api.updateClient(editing.id, data);
      setClients((list) =>
        list
          .map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.show("Cliente atualizado.");
    } else {
      const created = await api.createClient(data);
      setClients((list) =>
        [...list, { ...created, _count: { appointments: 0 } }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      toast.show("Cliente cadastrado.");
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await api.deleteClient(deleting.id);
      setClients((list) => list.filter((c) => c.id !== deleting.id));
      toast.show("Cliente removido.");
      setDeleting(null);
    } catch (err) {
      toast.show(err.message, "error");
    } finally {
      setDeleteBusy(false);
    }
  }

  if (!clients) {
    return <div className="loading">Carregando os clientes...</div>;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Clientes</h2>
          <p className="sub">
            {clients.length} {clients.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}.
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Novo cliente
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            placeholder="Buscar por nome ou email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar cliente"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">✂️</span>
          {query ? (
            <>
              <h4>Nenhum resultado para “{query}”</h4>
              <p>Confira a grafia ou limpe a busca.</p>
            </>
          ) : (
            <>
              <h4>Nenhum cliente cadastrado</h4>
              <p>Clique em “Novo cliente” para começar.</p>
            </>
          )}
        </div>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th className="th-notes">Observações</th>
                <th className="th-count">Atendimentos</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="td-name">
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.email}</td>
                  <td className="td-notes">{c.notes || "—"}</td>
                  <td className="td-count">{c._count?.appointments ?? 0}</td>
                  <td className="td-actions">
                    <button
                      className="icon-btn"
                      title="Editar cliente"
                      onClick={() => {
                        setEditing(c);
                        setFormOpen(true);
                      }}
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      title="Remover cliente"
                      onClick={() => setDeleting(c)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <ClientForm
          client={editing}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Remover cliente"
          message={
            <>
              Remover <strong>{deleting.name}</strong>? Todos os agendamentos vinculados a este
              cliente também serão removidos. Essa ação não pode ser desfeita.
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
