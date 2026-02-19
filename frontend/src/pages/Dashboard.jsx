import { useEffect, useMemo, useState } from "react";
import { FolderKanban, ListTodo, Users } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const role = user?.role;
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    return {
      projects: projects.length,
      clients: clients.length,
      tasks: tasks.length,
    };
  }, [projects, clients, tasks]);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        if (role === "Admin") {
          const [projectsResponse, clientsResponse, tasksResponse] =
            await Promise.all([
              api.get("/projects"),
              api.get("/clients"),
              api.get("/tasks"),
            ]);
          setProjects(projectsResponse.data || []);
          setClients(clientsResponse.data || []);
          setTasks(tasksResponse.data || []);
        } else if (role === "ProjectManager") {
          const [projectsResponse, clientsResponse, tasksResponse] =
            await Promise.all([
              api.get("/projects"),
              api.get("/clients"),
              api.get("/tasks"),
            ]);
          setProjects(projectsResponse.data || []);
          setClients(clientsResponse.data || []);
          setTasks(tasksResponse.data || []);
        } else {
          const [projectsResponse, tasksResponse] = await Promise.all([
            api.get("/projects"),
            api.get(`/tasks/user/${user.id}`),
          ]);
          setProjects(projectsResponse.data || []);
          setTasks(tasksResponse.data || []);
          setClients([]);
        }
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, role, user]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your work across projects.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Projects"
            value={loading ? "-" : stats.projects}
            icon={FolderKanban}
          />
          <StatCard
            title="Tasks"
            value={loading ? "-" : stats.tasks}
            icon={ListTodo}
          />
          {role !== "TeamMember" ? (
            <StatCard
              title="Clients"
              value={loading ? "-" : stats.clients}
              icon={Users}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
