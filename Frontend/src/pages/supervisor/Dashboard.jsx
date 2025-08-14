import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Context } from "../../main.jsx"; // ✅ get user from context
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area, CartesianGrid
} from "recharts";

const SupervisorDashboard = () => {
  const { user } = useContext(Context); // 👈 get supervisor info
  const [stats, setStats] = useState({ totalLogs: 0, violationsToday: 0 });

  const fetchStats = async () => {
    try {
      const zones = user?.assignedZones || [];

      let totalLogs = 0;
      let violationsToday = 0;

      for (const zone of zones) {
        const res = await axios.get(
          `http://localhost:8000/api/v1/log/zone/${zone}`,
          { withCredentials: true }
        );

        const logs = res.data.logs || [];
        totalLogs += logs.length;

        const today = new Date().toISOString().split("T")[0];
        violationsToday += logs.filter(log =>
          log.timestamp.startsWith(today)
        ).length;
      }

      setStats({ totalLogs, violationsToday });

    } catch (error) {
      console.error("Error fetching zone logs:", error);
    }
  };

  useEffect(() => {
    if (user?.assignedZones?.length) {
      fetchStats();
    }
  }, [user]);

  // 🎨 Simulated data for charts (using updated stats)
  const monthlyViolations = [
    { month: "Mar", count: 12 },
    { month: "Apr", count: 17 },
    { month: "May", count: 23 },
    { month: "Jun", count: 15 },
    { month: "Jul", count: 20 },
    { month: "Aug", count: stats.totalLogs || 0 },
  ];

  const ppeDistribution = [
    { name: "Helmet", value: 22 },
    { name: "Gloves", value: 16 },
    { name: "Shoes", value: 12 },
  ];

  const weeklyViolations = [
    { day: "Mon", count: 3 },
    { day: "Tue", count: 5 },
    { day: "Wed", count: 4 },
    { day: "Thu", count: 6 },
    { day: "Fri", count: 3 },
    { day: "Sat", count: 7 },
    { day: "Sun", count: 5 },
  ];

  const cumulativeLogs = [
    { month: "Jan", total: 20 },
    { month: "Feb", total: 38 },
    { month: "Mar", total: 50 },
    { month: "Apr", total: 67 },
    { month: "May", total: 90 },
    { month: "Jun", total: 110 },
    { month: "Jul", total: 130 },
    { month: "Aug", total: 130 + (stats.totalLogs || 0) },
  ];

  const pieColors = ["#3b82f6", "#22c55e", "#f97316"]; // ✅ blue-based palette for supervisor

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-tr from-blue-100 via-white to-blue-50 min-h-screen">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 text-center"
      >
        📊 SafeVision Supervisor Dashboard
      </motion.h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-400"
        >
          <h4 className="text-sm text-gray-500 mb-1">Total Violation Logs</h4>
          <p className="text-3xl font-bold text-blue-600">{stats.totalLogs}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-red-400"
        >
          <h4 className="text-sm text-gray-500 mb-1">Violations Today</h4>
          <p className="text-3xl font-bold text-red-600">{stats.violationsToday}</p>
        </motion.div>
      </div>

      {/* Monthly Violations */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Violation Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyViolations}>
            <XAxis dataKey="month" stroke="#3b82f6" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* PPE Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">PPE Violation Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={ppeDistribution}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {ppeDistribution.map((entry, index) => (
                <Cell key={index} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Line Chart: Weekly */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Violations - Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyViolations}>
            <XAxis dataKey="day" stroke="#3b82f6" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Area Chart: Cumulative Logs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Cumulative Logs Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={cumulativeLogs}>
            <defs>
              <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorLogs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default SupervisorDashboard;
