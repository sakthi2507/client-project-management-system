import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNotification } from "../auth/NotificationContext";

export default function RequestAdminAccessModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      addNotification("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      // Store request in localStorage for admin to see via notifications
      const request = {
        id: Date.now(),
        email: email.trim(),
        reason: reason.trim(),
        timestamp: new Date().toLocaleString(),
      };

      const existingRequests = JSON.parse(
        localStorage.getItem("admin_access_requests") || "[]",
      );
      existingRequests.push(request);
      localStorage.setItem(
        "admin_access_requests",
        JSON.stringify(existingRequests),
      );

      addNotification("Request sent! Admin will be notified.", "success");
      setEmail("");
      setReason("");
      onClose();
    } catch (error) {
      addNotification("Failed to send request", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Request Admin Access
        </h2>
        <p className="text-gray-600 mb-6">
          To create a new team member account, please submit your request below.
          An admin will review and set up your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent"
              placeholder="Why do you need admin access?"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#f05742] text-white rounded-lg font-medium hover:bg-[#e04632] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
