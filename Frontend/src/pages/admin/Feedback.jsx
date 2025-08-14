// AdminFeedback.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FiDownload, FiChevronDown, FiChevronUp } from "react-icons/fi";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Resolved: "bg-green-100 text-green-800",
};

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/feedback/all", {
        withCredentials: true,
      });
      setFeedbacks(res.data.feedback || []);
    } catch (err) {
      toast.error("Failed to fetch feedback");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8000/api/v1/feedback/${id}`,
        { status },
        { withCredentials: true }
      );
      toast.success("Status updated");
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id ? { ...fb, status } : fb))
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const newDirection =
        prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction: newDirection };
    });
  };

  const sortedData = [...feedbacks].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter((fb) => {
    const matchesStatus = filterStatus === "All" || fb.status === filterStatus;
    const matchesType = filterType === "All" || fb.type === filterType;
    const matchesSearch =
      fb.message.toLowerCase().includes(search.toLowerCase()) ||
      fb.type.toLowerCase().includes(search.toLowerCase()) ||
      fb.submittedBy?.firstname?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-6 font-['Inter'] min-h-screen bg-gradient-to-tr from-gray-50 via-white to-gray-100">
      <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-semibold text-gray-800 mb-4"
            >
              Feedbacks
            </motion.h2>
      {/* Filters */}
      <h3>Feedbacks</h3>
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="All">All Types</option>
          <option value="Bug">Bug</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Safety Issue">Safety Issue</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Search feedback..."
          className="border rounded-lg px-3 py-2 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border">
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {[
                { key: "submittedBy.firstname", label: "User" },
                { key: "type", label: "Type" },
                { key: "message", label: "Message" },
                { key: "attachments", label: "Attachments" },
                { key: "status", label: "Status" },
                { key: "createdAt", label: "Date" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="p-3 text-left cursor-pointer select-none"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig.key === col.key &&
                      (sortConfig.direction === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((fb, idx) => (
              <motion.tr
                key={fb._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3">
                  {fb.submittedBy?.firstname} {fb.submittedBy?.lastname}
                </td>
                <td className="p-3">{fb.type}</td>
                <td className="p-3">{fb.message}</td>
                <td className="p-3 flex gap-2 flex-wrap">
                  {fb.attachments?.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                    >
                      <FiDownload /> File {i + 1}
                    </a>
                  ))}
                </td>
                <td className="p-3">
                  <select
                    value={fb.status}
                    onChange={(e) => updateStatus(fb._id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-sm ${statusColors[fb.status]}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
                <td className="p-3">
                  {new Date(fb.createdAt).toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
