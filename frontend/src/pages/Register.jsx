import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

const roles = ["Admin", "ProjectManager", "TeamMember"];

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  role: "ProjectManager",
};

export default function Register() {
  const { user, loading: authLoading } = useAuth();
  const role = user?.role;
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const isPasswordValid = useMemo(
    () => form.password.length >= 6,
    [form.password],
  );
  const isFormValid = useMemo(() => {
    return (
      form.full_name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      isPasswordValid
    );
  }, [form, isPasswordValid]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid) {
      setError(
        "Please fill all required fields. Password must be at least 6 characters.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess(`✓ Account created for ${form.email.trim()}!`);
      setForm(initialForm);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Registration failed.";
      // Handle duplicate email error
      if (detail.includes("already")) {
        setError(`❌ ${detail} Please use a different email address.`);
      } else {
        setError(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {!authLoading && role !== "Admin" ? (
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-sm text-gray-600 shadow-md">
          Only Admin users can register new team members.
        </div>
      ) : (
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#EF4444]">
              <span className="text-lg font-bold text-white">iN</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Register a new internal team member
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            ) : null}

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="full_name"
              >
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                placeholder="jane@inextlabs.com"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                placeholder="Minimum 6 characters"
              />
              {!isPasswordValid && form.password.length > 0 ? (
                <p className="mt-2 text-xs text-red-600">
                  Password must be at least 6 characters.
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="role"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF4444] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
