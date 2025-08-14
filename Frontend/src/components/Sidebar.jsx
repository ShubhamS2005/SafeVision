import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Context } from "../main.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard,
  MdGroups,
  MdLogout,
  MdAnalytics,
  MdSettings,
  MdPersonAddAlt1,
  MdReportGmailerrorred,
  MdNotificationsActive,
  MdCloudDownload,
  MdMenu,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";

const Sidebar = ({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  isMobile,
}) => {
  const { user, setIsAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const handleLogout = async () => {
    try {
      const url =
        user.role === "Admin"
          ? "http://localhost:8000/api/v1/user/admin/logout"
          : "http://localhost:8000/api/v1/user/supervisor/logout";

      const res = await axios.get(url, { withCredentials: true });
      toast.success(res.data.message);
      setIsAuthenticated(false);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");

    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const adminLinks = [
    { to: "/", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/supervisors", label: "Supervisors", icon: <MdGroups /> },
    { to: "/admin/add", label: "Add User", icon: <MdPersonAddAlt1 /> },
    { to: "/reports", label: "Analytics", icon: <MdAnalytics /> },
    { to: "/feedback", label: "Feedback", icon: <MdNotificationsActive /> },

  ];

  const supervisorLinks = [
    { to: "/", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/zonelogs", label: "Zone Logs", icon: <MdReportGmailerrorred /> },
    { to: "/alerts", label: "Live Alerts", icon: <MdNotificationsActive /> },
    { to: "/feedback", label: "Feedback", icon: <MdNotificationsActive /> },
  ];

  const roleLinks = user?.role === "Admin" ? adminLinks : supervisorLinks;

  return (
    <>
      {/* 🍔 Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-[100] bg-orange-600 text-white p-2 rounded-full shadow-md hover:bg-orange-700 transition-all duration-300"
        >
          {isOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: isMobile ? -250 : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -250 : 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className={`fixed top-0 left-0 z-50 h-full text-white shadow-xl flex flex-col transition-all duration-300
  ${!isOpen ? "hidden" : ""}
  ${isCollapsed ? "w-20" : "w-64"}
  bg-[#1e1e2f] text-white shadow-xl`}
          >
            {/* Header */}
            <div className="mt-6 flex items-center justify-between px-4 py-5 border-b border-gray-700 dark:border-gray-200">
              {!isCollapsed && (
                <span className="text-xl font-bold">
                  SafeVision{" "}
                  <span className="text-orange-400 text-sm font-semibold">
                    {user?.role}
                  </span>
                </span>
              )}
              {!isMobile && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="fixed top-4 left-4 z-[100] bg-orange-600 text-white p-2 rounded-full shadow-md transition hover:bg-orange-700"
                >
                  {isCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
                </button>
              )}
            </div>

            {/* Links */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {roleLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  title={isCollapsed ? label : ""}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-md font-medium transition-all ${
                      isActive
                        ? "bg-orange-600 text-white dark:text-white"
                        : "hover:bg-white/10 hover:text-orange-300 dark:hover:bg-gray-200 dark:hover:text-black"
                    }`
                  }
                >
                  <span className="text-xl">{icon}</span>
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </nav>

            {/* Theme + Logout */}
            <div className="border-t border-gray-700 dark:border-gray-300 px-4 py-4 flex flex-col gap-3">
              {/* 🚪 Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-400 hover:text-white dark:hover:text-red-600 transition"
                title={isCollapsed ? "Logout" : ""}
              >
                <MdLogout className="text-xl" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;