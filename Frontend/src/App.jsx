import React, { useContext, useEffect, useState } from "react";
import {
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import SupervisorLayout from "./layouts/SupervisorLayout.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AddUser from "./pages/admin/AddUser.jsx";
import Supervisors from "./pages/admin/Supervisors.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import AdminFeedback from "./pages/admin/Feedback.jsx";

// Supervisor Pages
import SupervisorDashboard from "./pages/supervisor/Dashboard.jsx";
import SupervisorLogs from "./pages/supervisor/Logs.jsx";
import Alerts from "./pages/supervisor/Alerts.jsx";
import Feedback from "./pages/supervisor/Feedback.jsx";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";

function App() {
  const { isAuthenticated, setIsAuthenticated, setUser, user} =
    useContext(Context);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        {isAuthenticated && user?.role === "Admin" && (
          <>
            <Route path="/" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/add" element={<AdminLayout><AddUser /></AdminLayout>} />
            <Route path="/supervisors" element={<AdminLayout><Supervisors /></AdminLayout>} />
            <Route path="/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
            <Route path="/feedback" element={<AdminLayout><AdminFeedback/></AdminLayout>} />

          </>
        )}

        {/* Supervisor Routes */}
        {isAuthenticated && user?.role === "Supervisor" && (
          <>
            <Route path="/" element={<SupervisorLayout><SupervisorDashboard /></SupervisorLayout>} />
            <Route path="/zonelogs" element={<SupervisorLayout><SupervisorLogs /></SupervisorLayout>} />
            <Route path="/alerts" element={<SupervisorLayout><Alerts /></SupervisorLayout>} />
            <Route path="/feedback" element={<SupervisorLayout><Feedback /></SupervisorLayout>} />
          </>
        )}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
}

export default App;
