import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

const emptyForm = {
  name: "",
  contact_info: "",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function Clients() {
  const { user, loading: authLoading } = useAuth();
  const role = user?.role;
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => b.id - a.id);
  }, [clients]);

  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/clients");
      setClients(response.data || []);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to load clients.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (!authLoading && role === "TeamMember") {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Clients are available to Admin and Project Managers only.
        </div>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Client name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/clients", {
        name: form.name.trim(),
        contact_info: form.contact_info.trim() || null,
      });
      await fetchClients();
      setShowModal(false);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to create client.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId) => {
    const confirmed = window.confirm("Delete this client?");
    if (!confirmed) return;

    setError("");
    try {
      await api.delete(`/clients/${clientId}`);
      setClients((prev) => prev.filter((client) => client.id !== clientId));
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to delete client.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of client profiles and primary contacts.
            </p>
          </div>
          {role !== "TeamMember" ? (
            <button
              type="button"
              onClick={openModal}
              className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#dc2626]"
            >
              Create Client
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact Info</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Loading clients...
                    </td>
                  </tr>
                ) : sortedClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No clients yet. Add your first client.
                    </td>
                  </tr>
                ) : (
                  sortedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {client.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {client.contact_info || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(client.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {role === "Admin" ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(client.id)}
                            className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Client
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a new client with contact details.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#EF4444] focus:outline-none"
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Contact Info
                </label>
                <input
                  name="contact_info"
                  value={form.contact_info}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#EF4444] focus:outline-none"
                  placeholder="email@acme.com"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:bg-[#fca5a5]"
                >
                  {saving ? "Saving..." : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
