import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { FaFileCsv } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Context } from "../../main"; // Adjust path
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SupervisorLogs = () => {
  const { user } = useContext(Context);
  const [logsByZone, setLogsByZone] = useState({});
  const [activeZone, setActiveZone] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 6;

  // Fetch logs for assigned zones
  const fetchLogsForZones = async () => {
    if (!user?.assignedZones?.length) return;
    setLoading(true);

    try {
      const dataObj = {};
      await Promise.all(
        user.assignedZones.map(async (zone) => {
          const res = await axios.get(
            `http://localhost:8000/api/v1/log/zone/${zone}`,
            { withCredentials: true }
          );
          dataObj[zone] = res.data.logs || [];
        })
      );
      setLogsByZone(dataObj);
      setActiveZone(user.assignedZones[0]);
    } catch (err) {
      console.error("Error fetching supervisor logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsForZones();
  }, [user]);

  // Flatten all logs for stats
  const allLogs = Object.values(logsByZone).flat();
  const totalViolations = allLogs.length;
  const unresolvedCount = allLogs.filter((log) => log.status === "Unresolved").length;

  // Filter current zone logs
  const currentZoneLogs = logsByZone[activeZone] || [];
  const filteredLogs = currentZoneLogs.filter((log) => {
    const matchStatus = statusFilter ? log.status === statusFilter : true;
    const matchDate =
      startDate && endDate
        ? new Date(log.timestamp) >= startDate &&
          new Date(log.timestamp) <= endDate
        : true;
    const matchSearch = log.ppeMissing
      .join(",")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchStatus && matchDate && matchSearch;
  });

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // CSV Export
  const exportCSV = () => {
    const headers = ["Zone", "PPE Missing", "Status", "Timestamp", "Snapshot"];
    const rows = filteredLogs.map((log) => [
      log.zone,
      log.ppeMissing.join(" | "),
      log.status,
      new Date(log.timestamp).toLocaleString(),
      log.snapshotUrl,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.setAttribute("href", encodedUri);
    a.setAttribute("download", `SafeVision_${activeZone}_Logs.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Prepare mini chart data
  const getZoneChartData = (zone) => {
    const zoneLogs = logsByZone[zone] || [];
    const resolved = zoneLogs.filter((l) => l.status === "Resolved").length;
    const unresolved = zoneLogs.filter((l) => l.status === "Unresolved").length;
    return [
      { name: "Resolved", value: resolved },
      { name: "Unresolved", value: unresolved },
    ];
  };

  return (
    <div className="p-4 md:p-6 font-['Inter'] space-y-6">
      {/* Page Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-gray-800"
      >
        Supervisor Logs
      </motion.h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-xl p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Violations</p>
          <p className="text-3xl font-bold text-blue-600">{totalViolations}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-xl p-5 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Unresolved Violations</p>
          <p className="text-3xl font-bold text-red-600">{unresolvedCount}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-xl p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Zones Assigned</p>
          <p className="text-3xl font-bold text-green-600">{user?.assignedZones?.length || 0}</p>
        </motion.div>
      </div>

      {/* Zone Mini Charts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {user?.assignedZones?.map((zone, idx) => (
          <motion.div
            key={zone}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-800">{zone}</h4>
              <span className="text-sm text-gray-500">{logsByZone[zone]?.length || 0} logs</span>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getZoneChartData(zone)} layout="vertical" barSize={15}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 4, 4]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              onClick={() => {
                setActiveZone(zone);
                setCurrentPage(1);
              }}
              className={`mt-3 px-3 py-1 text-sm rounded-lg ${
                activeZone === zone ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              View Logs
            </button>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center border rounded-md px-3 py-2 bg-white shadow-sm">
          <FiSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search PPE"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 w-full outline-none text-sm text-gray-700"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 text-sm rounded-md shadow-sm text-gray-700"
        >
          <option value="">All Status</option>
          <option value="Resolved">Resolved</option>
          <option value="Unresolved">Unresolved</option>
        </select>

        <div className="flex gap-2">
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" className="border px-2 py-1 text-sm rounded-md" maxDate={new Date()} />
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" className="border px-2 py-1 text-sm rounded-md" maxDate={new Date()} />
        </div>
      </div>

      {/* Export Button */}
      <div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          <FaFileCsv /> Export CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : currentLogs.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No logs found</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-sm text-left font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">PPE Missing</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {currentLogs.map((log, index) => (
                <motion.tr
                  key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-blue-50"
                >
                  <td className="px-4 py-3">{log.zone}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">{log.ppeMissing.join(", ")}</td>
                  <td className="px-4 py-3">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium ${log.status === "Unresolved" ? "text-red-600" : "text-green-600"}`}>
                    {log.status}
                  </td>
                  <td className="px-4 py-3">
                    <a href={log.snapshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      View Image
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredLogs.length > logsPerPage && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(filteredLogs.length / logsPerPage) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorLogs;
