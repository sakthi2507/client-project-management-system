import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function AdminRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Only Admin users can
            register new team members.
          </p>
          <a
            href="/dashboard"
            className="text-[#f05742] font-medium hover:underline"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
