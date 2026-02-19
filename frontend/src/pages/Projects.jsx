import { useEffect, useMemo, useState } from "react";
import { projectsAPI } from "../utils/api";
import { useAuth } from "../auth/useAuth";
import api from "../api/axios";

const emptyForm = {
  name: "",
  description: "",
  client_id: "",
  status: "NotStarted",
  start_date: "",
  end_date: "",
};

const statusOptions = [
  { value: "NotStarted", label: "Not Started" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

const getStatusBadge = (status) => {
  if (status === "NotStarted") return "bg-slate-100 text-slate-800";
  if (status === "InProgress") return "bg-blue-100 text-blue-800";
  if (status === "Completed") return "bg-green-100 text-green-800";
  return "bg-slate-100 text-slate-700";
};

const getStatusLabel = (status) => {
  if (status === "NotStarted") return "Not Started";
  if (status === "InProgress") return "In Progress";
  if (status === "Completed") return "Completed";
  return status || "-";
};

const formatDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const normalizeForm = (form) => ({
  name: form.name.trim(),
  description: form.description.trim() || null,
  client_id: Number(form.client_id),
  status: form.status,
  start_date: form.start_date || null,
  end_date: form.end_date || null,
});

export default function Projects() {
  const { user } = useAuth();
  const role = user?.role;
  const [projects, setProjects] = useState([]);
  const [projectTeamMembers, setProjectTeamMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Role-based filtering
    if (role === "TeamMember") {
      // TeamMembers only see projects they're assigned to
      filtered = filtered.filter((project) =>
        projectTeamMembers[project.id]?.some(
          (member) => member.id === user?.id,
        ),
      );
    }

    return filtered.sort((a, b) => b.id - a.id);
  }, [projects, projectTeamMembers, role, user?.id]);

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data || []);

      // Load team members for each project
      if (response.data && response.data.length > 0) {
        const teamMembersData = {};
        for (const project of response.data) {
          try {
            const teamResponse = await api.get(
              `/assignments/project/${project.id}`,
            );
            teamMembersData[project.id] = teamResponse.data || [];
          } catch (err) {
            console.error(`Failed to load team for project ${project.id}`);
            teamMembersData[project.id] = [];
          }
        }
        setProjectTeamMembers(teamMembersData);
      }
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to load projects.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreate = () => {
    setIsEditing(false);
    setActiveId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (project) => {
    setIsEditing(true);
    setActiveId(project.id);
    setForm({
      name: project.name || "",
      description: project.description || "",
      client_id: project.client_id?.toString() || "",
      status: project.status || "NotStarted",
      start_date: formatDateForInput(project.start_date),
      end_date: formatDateForInput(project.end_date),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.client_id) {
      setError("Name and client id are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = normalizeForm(form);
      if (isEditing && activeId) {
        await projectsAPI.update(activeId, payload);
      } else {
        await projectsAPI.create(payload);
      }
      await loadProjects();
      setShowModal(false);
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to save project.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    setError("");
    try {
      await projectsAPI.delete(projectId);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      const message =
        err?.response?.data?.detail || "Failed to delete project.";
      setError(message);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    setError("");
    try {
      const response = await projectsAPI.updateStatus(projectId, newStatus);
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? response.data : project,
        ),
      );
    } catch (err) {
      const message =
        err?.response?.data?.detail || "Failed to update project status.";
      setError(message);
    }
  };

  const canUpdateStatus = (project) => {
    if (role === "Admin") return true;
    if (role === "ProjectManager") return true;
    if (role === "TeamMember") return true; // Team members can update progress of their projects
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track active projects and manage project details.
            </p>
          </div>
          {role !== "TeamMember" ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              New Project
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
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Team Members</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Loading projects...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      {role === "TeamMember"
                        ? "No projects assigned to you yet."
                        : "No projects yet. Create one to get started."}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {project.name}
                      </td>
                      <td className="px-4 py-3">
                        {role !== "TeamMember" ||
                        role === "Admin" ||
                        role === "ProjectManager" ? (
                          <select
                            value={project.status}
                            onChange={(e) =>
                              handleStatusChange(project.id, e.target.value)
                            }
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer ${getStatusBadge(
                              project.status,
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
                              project.status,
                            )}`}
                          >
                            {getStatusLabel(project.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {projectTeamMembers[project.id]?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {projectTeamMembers[project.id]
                                .slice(0, 3)
                                .map((member) => (
                                  <span
                                    key={member.id}
                                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                                  >
                                    {member.email.split("@")[0]}
                                  </span>
                                ))}
                              {projectTeamMembers[project.id].length > 3 && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                  +{projectTeamMembers[project.id].length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              No teams assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        #{project.client_id}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateForInput(project.start_date) || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {role !== "TeamMember" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveId(project.id);
                                  setExpandedProject(project.id);
                                }}
                                className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                              >
                                Teams
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(project)}
                                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                Edit
                              </button>
                            </>
                          ) : null}
                          {role === "Admin" ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(project.id)}
                              className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
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
                  {isEditing ? "Edit Project" : "Create Project"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditing
                    ? "Update project details and timeline."
                    : "Add a new project to the portfolio."}
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
                  Project Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Project Aurora"
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
                  placeholder="What is this project about?"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Client ID
                  </label>
                  <input
                    name="client_id"
                    value={form.client_id}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="12"
                    required
                  />
                </div>
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Start Date
                  </label>
                  <input
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    type="date"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    End Date
                  </label>
                  <input
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    type="date"
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
                  {saving
                    ? "Saving..."
                    : isEditing
                      ? "Save Changes"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {expandedProject ? (
        <TeamsModal
          projectId={expandedProject}
          projectName={projects.find((p) => p.id === expandedProject)?.name}
          teamMembers={projectTeamMembers[expandedProject] || []}
          onClose={() => setExpandedProject(null)}
          onTeamChange={() => loadProjects()}
          role={role}
        />
      ) : null}
    </div>
  );
}

function TeamsModal({
  projectId,
  projectName,
  teamMembers,
  onClose,
  onTeamChange,
  role,
}) {
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [assignmentRecords, setAssignmentRecords] = useState({});
  const [error, setError] = useState("");

  const loadAllUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await api.get("/users");
      setAllUsers(response.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Unable to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadAllUsers();
    }
  }, [projectId]);

  const availableUsers = allUsers.filter(
    (user) => !teamMembers.some((member) => member.id === user.id),
  );

  const handleAddUser = async (userId) => {
    try {
      await api.post("/assignments/", {
        user_id: userId,
        project_id: projectId,
      });
      onTeamChange();
      setError("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to add user");
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      // Find the assignment record and delete it
      // We'll need to query all to find the right one
      const assignmentResponse = await api.get("/assignments");
      const assignment = assignmentResponse.data?.find(
        (a) => a.user_id === userId && a.project_id === projectId,
      );

      if (assignment) {
        await api.delete(`/assignments/${assignment.id}`);
        onTeamChange();
        setError("");
      } else {
        setError("Assignment not found");
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to remove user");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-96 overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Manage Team - {projectName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add or remove team members from this project
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Current Team Members */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Current Team ({teamMembers.length})
            </h3>
            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {member.email}
                      </p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                    {role === "Admin" && (
                      <button
                        onClick={() => handleRemoveUser(member.id)}
                        className="text-rose-600 hover:text-rose-700 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No team members assigned
              </p>
            )}
          </div>

          {/* Available Users to Add */}
          {role === "Admin" || role === "ProjectManager" ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Add Team Member
              </h3>
              {usersLoading ? (
                <p className="text-sm text-slate-500">Loading users...</p>
              ) : availableUsers.length > 0 ? (
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.email}
                        </p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                      </div>
                      <button
                        onClick={() => handleAddUser(user.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  All users are already assigned
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
