import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./auth/AuthContext";
import { NotificationProvider } from "./auth/NotificationContext";
import NotificationCenter from "./components/NotificationCenter";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <NotificationCenter />
        </Router>
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
