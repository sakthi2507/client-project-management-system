import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

const emptyForm = {
  title: "",
  description: "",
  status: "ToDo",
  assigned_to: "",
  project_id: "",
  due_date: "",
};

const statusOptions = [
  { value: "ToDo", label: "Pending" },
  { value: "InProgress", label: "InProgress" },
  { value: "Done", label: "Completed" },
];

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const getStatusLabel = (status) => {
  if (status === "ToDo") return "Pending";
  if (status === "InProgress") return "InProgress";
  if (status === "Done") return "Completed";
  return status || "-";
};

const getStatusBadge = (status) => {
  if (status === "ToDo") return "bg-yellow-100 text-yellow-800";
  if (status === "InProgress") return "bg-blue-100 text-blue-800";
  if (status === "Done") return "bg-green-100 text-green-800";
  return "bg-slate-100 text-slate-700";
};

export default function Tasks() {
  const { user } = useAuth();
  const role = user?.role;
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [assignedUsersLoading, setAssignedUsersLoading] = useState(false);
  const [teamUsers, setTeamUsers] = useState([]);
  const [teamUsersLoading, setTeamUsersLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const selectedProject = projects.find(
    (p) => p.id === Number(form.project_id),
  );
  const availableUsers = assignedUsers; // Only show users assigned to selected project
  const usersLoading = assignedUsersLoading;

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.id - a.id);
  }, [tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/tasks");
      setTasks(response.data || []);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to load tasks.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await api.get("/projects");
      setProjects(response.data || []);
    } catch (err) {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchAssignedUsers = async (projectId) => {
    if (!projectId) {
      setAssignedUsers([]);
      return;
    }

    setAssignedUsersLoading(true);
    try {
      const response = await api.get(`/assignments/project/${projectId}`);
      setAssignedUsers(response.data || []);
    } catch (err) {
      setAssignedUsers([]);
    } finally {
      setAssignedUsersLoading(false);
    }
  };

  const fetchTeamUsers = async () => {
    setTeamUsersLoading(true);
    try {
      const response = await api.get("/users");
      setTeamUsers(response.data || []);
    } catch (err) {
      setTeamUsers([]);
    } finally {
      setTeamUsersLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setCurrentUser(response.data);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchCurrentUser();
    fetchTeamUsers();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    fetchAssignedUsers(form.project_id);
  }, [showModal, form.project_id]);

  const openModal = () => {
    const defaultProjectId = projects[0]?.id ? String(projects[0].id) : "";
    setForm({ ...emptyForm, project_id: defaultProjectId });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "project_id" ? { assigned_to: "" } : null),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.project_id) {
      setError("Title and project id are required.");
      return;
    }

    const projectId = Number(form.project_id);
    if (!projects.some((project) => project.id === projectId)) {
      setError("Project not found. Please select a valid project.");
      return;
    }

    const assignedUserId = form.assigned_to ? Number(form.assigned_to) : null;
    if (assignedUserId) {
      const isAssigned = assignedUsers.some(
        (user) => user.id === assignedUserId,
      );
      if (!isAssigned) {
        try {
          await api.post("/assignments", {
            user_id: assignedUserId,
            project_id: projectId,
          });
        } catch (err) {
          const message =
            err?.response?.data?.detail ||
            "User must be assigned to the project before being assigned tasks.";
          setError(message);
          return;
        }
      }
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/tasks", {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        assigned_to: assignedUserId,
        project_id: projectId,
        due_date: form.due_date || null,
      });
      await fetchTasks();
      setShowModal(false);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to create task.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    setError("");
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to delete task.";
      setError(message);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setError("");
    try {
      const response = await api.patch(
        `/tasks/${taskId}/status?status=${newStatus}`,
      );
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data : task)),
      );
    } catch (err) {
      const message =
        err?.response?.data?.detail || "Failed to update task status.";
      setError(message);
    }
  };

  const canUpdateStatus = (task) => {
    if (role === "Admin") return true;
    if (role === "ProjectManager") return true;
    if (role === "TeamMember" && task.assigned_to === currentUser?.id)
      return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor task progress across active projects.
            </p>
          </div>
          {role !== "TeamMember" ? (
            <button
              type="button"
              onClick={openModal}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Create Task
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
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Loading tasks...
                    </td>
                  </tr>
                ) : sortedTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No tasks yet. Create the first task.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {task.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {task.description || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {canUpdateStatus(task) ? (
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value)
                            }
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer ${getStatusBadge(
                              task.status,
                            )}`}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(
                              task.status,
                            )}`}
                          >
                            {getStatusLabel(task.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {task.assigned_to
                          ? `#${task.assigned_to}`
                          : "Unassigned"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        #{task.project_id}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(task.due_date)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {role === "Admin" ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
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
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Task
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a new task and assign it to a project.
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
                  Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Draft onboarding checklist"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Add more details about the task"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Assign To Team Member
                  </label>
                  {!form.project_id ? (
                    <div className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 bg-slate-50">
                      Select a project first to see available team members
                    </div>
                  ) : usersLoading ? (
                    <div className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 bg-slate-50">
                      Loading team members...
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-700 bg-amber-50">
                      ⚠️ No team members assigned to this project yet
                    </div>
                  ) : (
                    <select
                      name="assigned_to"
                      value={form.assigned_to}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    >
                      <option value="">Unassigned - Unassigned</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email} ({user.role})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Project
                  </label>
                  <div className="mt-2 space-y-2">
                    <select
                      name="project_id"
                      value={form.project_id}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      disabled={projectsLoading || projects.length === 0}
                      required
                    >
                      {projectsLoading ? (
                        <option value="">Loading projects...</option>
                      ) : projects.length === 0 ? (
                        <option value="">No projects available</option>
                      ) : (
                        <option value="">Select a project</option>
                      )}
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    {selectedProject && (
                      <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded">
                        <p className="font-semibold">
                          {selectedProject.description || "No description"}
                        </p>
                        <p className="mt-1">
                          📋 Status:{" "}
                          <span className="capitalize">
                            {selectedProject.status}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Due Date
                  </label>
                  <input
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    type="datetime-local"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>
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
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? "Saving..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
