import { Bell, User, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useState, useEffect } from "react";

export default function Topbar() {
  const location = useLocation();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [requests, setRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role === "Admin") {
      loadRequests();
      const interval = setInterval(loadRequests, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadRequests = () => {
    const storedRequests = JSON.parse(
      localStorage.getItem("admin_access_requests") || "[]",
    );
    const readRequests = JSON.parse(
      localStorage.getItem("read_requests") || "[]",
    );
    setRequests(storedRequests);
    const unread = storedRequests.filter(
      (r) => !readRequests.includes(r.id),
    ).length;
    setUnreadCount(unread);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      const readRequests = JSON.parse(
        localStorage.getItem("read_requests") || "[]",
      );
      requests.forEach((r) => {
        if (!readRequests.includes(r.id)) {
          readRequests.push(r.id);
        }
      });
      localStorage.setItem("read_requests", JSON.stringify(readRequests));
      setUnreadCount(0);
    }
  };

  const removeRequest = (id) => {
    const updated = requests.filter((r) => r.id !== id);
    localStorage.setItem("admin_access_requests", JSON.stringify(updated));
    setRequests(updated);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/projects") return "Projects";
    if (path === "/clients") return "Clients";
    if (path === "/tasks") return "Tasks";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {getPageTitle()}
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && user?.role === "Admin" && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    Admin Requests
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {requests.length > 0
                      ? `${requests.length} access request${requests.length !== 1 ? "s" : ""}`
                      : "No pending requests"}
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {requests.length > 0 ? (
                    requests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {req.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {req.timestamp}
                            </p>
                          </div>
                          <button
                            onClick={() => removeRequest(req.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {req.reason && (
                          <p className="text-xs text-gray-600 mb-3">
                            {req.reason}
                          </p>
                        )}
                        <Link
                          to="/register"
                          className="inline-block px-3 py-1.5 bg-[#f05742] text-white text-xs rounded hover:bg-[#e04632]"
                        >
                          Register User
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-sm">No pending requests</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {user?.role === "Admin" ? (
            <Link
              to="/register"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Add team member"
              title="Add team member"
            >
              <User className="h-5 w-5 text-gray-600" />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
