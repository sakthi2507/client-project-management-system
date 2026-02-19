import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

export default function Assignments() {
  const { user, loading: authLoading } = useAuth();
  const role = user?.role;
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");
  const [userId, setUserId] = useState("");

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.email.localeCompare(b.email));
  }, [users]);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data || []);
    } catch (err) {
      setProjects([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data || []);
    } catch (err) {
      setUsers([]);
    }
  };

  const fetchMembers = async (id) => {
    if (!id) {
      setMembers([]);
      return;
    }
    try {
      const response = await api.get(`/assignments/project/${id}`);
      setMembers(response.data || []);
    } catch (err) {
      setMembers([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchProjects(), fetchUsers()]);
      } catch (err) {
        setError("Failed to load teams data.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    fetchMembers(projectId);
  }, [projectId]);

  if (!authLoading && role === "TeamMember") {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Team assignments are available to Admin and Project Managers only.
        </div>
      </div>
    );
  }

  const handleAssign = async (event) => {
    event.preventDefault();
    if (!projectId || !userId) {
      setError("Select both a project and a user.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/assignments", {
        project_id: Number(projectId),
        user_id: Number(userId),
      });
      await fetchMembers(projectId);
    } catch (err) {
      const message =
        err?.response?.data?.detail || "Failed to assign user to project.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Teams</h1>
            <p className="mt-1 text-sm text-slate-500">
              Assign team members to projects.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Assign member
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a project and a user to add.
            </p>

            <form onSubmit={handleAssign} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Project
                </label>
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  disabled={loading}
                >
                  <option value="">Select a project</option>
                  {sortedProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      #{project.id} {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  User
                </label>
                <select
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  disabled={loading}
                >
                  <option value="">Select a user</option>
                  {sortedUsers.map((member) => (
                    <option key={member.id} value={member.id}>
                      #{member.id} {member.full_name || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? "Assigning..." : "Assign to project"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Project members
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {projectId
                ? "Members assigned to the selected project."
                : "Select a project to see its members."}
            </p>

            <div className="mt-4 space-y-3">
              {projectId && members.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  No members assigned yet.
                </div>
              ) : null}
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {member.full_name || member.email}
                    </p>
                    <p className="text-xs text-slate-500">#{member.id}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
