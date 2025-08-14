import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { MdFilterList } from "react-icons/md";
import { FaFileCsv } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminReports = () => {
  const [logs, setLogs] = useState([]);
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 6;
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch all logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/v1/log/all", {
        withCredentials: true,
      });
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs
    .filter((log) => {
      const matchZone = zoneFilter ? log.zone === zoneFilter : true;
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
      return matchZone && matchStatus && matchDate && matchSearch;
    })
    .sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (sortBy === "timestamp") {
        return sortOrder === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
      }
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  // Pagination slice
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Export CSV
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
    a.setAttribute("download", `SafeVision_Logs_${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-4 md:p-6 font-['Inter']">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-semibold text-gray-800 mb-4"
      >
        PPE Violation Logs
      </motion.h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="border px-3 py-2 text-sm rounded-md shadow-sm text-gray-700"
        >
          <option value="">All Zones</option>
          <option value="Zone A">Zone A</option>
          <option value="Zone B">Zone B</option>
          <option value="Zone C">Zone C</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 text-sm rounded-md shadow-sm text-gray-700"
        >
          <option value="">All Status</option>
          <option value="Resolved">Resolved</option>
          <option value="Unresolved">Unresolved</option>
        </select>
      </div>

      {/* Date Pickers & Export */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
          className="border px-2 py-1 text-sm rounded-md"
          maxDate={new Date()}
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
          className="border px-2 py-1 text-sm rounded-md"
          maxDate={new Date()}
        />
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
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-100 text-sm text-left font-semibold text-gray-700">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => toggleSort("zone")}
                >
                  Zone {sortBy === "zone" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3">PPE Missing</th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => toggleSort("timestamp")}
                >
                  Timestamp{" "}
                  {sortBy === "timestamp" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {currentLogs.map((log, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-orange-50"
                >
                  <td className="px-4 py-3">{log.zone}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">
                    {log.ppeMissing.join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{log.status}</td>
                  <td className="px-4 py-3">
                    <a
                      href={log.snapshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Image
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredLogs.length > logsPerPage && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({
            length: Math.ceil(filteredLogs.length / logsPerPage),
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage === i + 1
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700"
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

export default AdminReports;
