// Add to the top of the file
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../admin/logo.png";
const zones = ["Zone A", "Zone B", "Zone C"];

const Supervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedZones, setSelectedZones] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // New toggle state

  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(6); // or 9 for 3x3 cards
const [sortBy, setSortBy] = useState("firstname");
const [sortOrder, setSortOrder] = useState("asc");


  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/admin/supervisors",
        {
          withCredentials: true,
        }
      );

      const data = res.data.supervisors || [];
      setSupervisors(data);
      setFiltered(data);

      const initialZones = {};
      data.forEach((sup) => {
        initialZones[sup._id] = sup.assignedZones || [];
      });
      setSelectedZones(initialZones);
    } catch (error) {
      toast.error("❌ Failed to fetch supervisors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  useEffect(() => {
    let filteredData = supervisors;

    if (search) {
      filteredData = filteredData.filter((sup) =>
        `${sup.firstname} ${sup.lastname} ${sup.email} ${sup.phone}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (dateFilter) {
      filteredData = filteredData.filter(
        (sup) => sup.createdAt?.slice(0, 10) === dateFilter
      );
    }

    setFiltered(filteredData);
  }, [search, dateFilter, supervisors]);

  const handleZoneToggle = (supervisorId, zone) => {
    const current = selectedZones[supervisorId] || [];
    const updated = current.includes(zone)
      ? current.filter((z) => z !== zone)
      : [...current, zone];

    setSelectedZones((prev) => ({
      ...prev,
      [supervisorId]: updated,
    }));
  };



  const handleAssign = async (supervisorId) => {
    try {
      setUpdatingId(supervisorId);
      const zonesToAssign = selectedZones[supervisorId] || [];

      await axios.put(
        `http://localhost:8000/api/v1/user/admin/assign-zones/${supervisorId}`,
        { zones: zonesToAssign },
        { withCredentials: true }
      );

      toast.success("✅ Zones updated successfully!", { autoClose: 2000 });
    } catch (error) {
      toast.error("❌ Failed to assign zones");
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const data = filtered.map((sup) => ({
      Name: `${sup.firstname} ${sup.lastname}`,
      Email: sup.email,
      Phone: sup.phone,
      Avatar: sup.userAvatar?.url || "N/A",
      Zones: (selectedZones[sup._id] || []).join(", "),
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Supervisors");
    writeFile(wb, "supervisors.csv");
    toast.success("✅ CSV exported!", { autoClose: 1500 });
  };

  const exportPDF = () => {
  const doc = new jsPDF("landscape", "pt", "A4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoImg = new Image();
  logoImg.src = logo;

  logoImg.onload = () => {
    // 🖼 Add Logo
    doc.addImage(logoImg, "PNG", 40, 25, 50, 50);

    // 📌 Title
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("Supervisor Zone Assignment", pageWidth / 2, 50, { align: "center" });

    // 🔄 Table Data
    const tableData = filtered.map((sup, i) => [
      i + 1,
      `${sup.firstname} ${sup.lastname}`,
      sup.email,
      sup.phone,
      sup.userAvatar?.url || "N/A",
      (selectedZones[sup._id] || []).join(", ") || "None",
    ]);

    // 🧾 Render Table
    autoTable(doc, {
      startY: 80,
      head: [["#", "Name", "Email", "Phone", "Avatar URL", "Assigned Zones"]],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 6,
        valign: "middle",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [255, 100, 0],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 110 },
        2: { cellWidth: 170 },
        3: { cellWidth: 90 },
        4: { cellWidth: 190 },
        5: { cellWidth: 120 },
      },
      margin: { top: 60, bottom: 150 },
    });

    // 📊 Summary & Chart
    const zoneStats = { "Zone A": 0, "Zone B": 0, "Zone C": 0 };
    filtered.forEach((sup) => {
      (selectedZones[sup._id] || []).forEach((z) => {
        if (zoneStats[z] !== undefined) zoneStats[z]++;
      });
    });

    const totalSupervisors = filtered.length;
    const chartStartY = doc.lastAutoTable.finalY + 40;

    // 📍 Summary Text
    doc.setFontSize(13);
    doc.setTextColor(40);
    doc.text("Summary", 40, chartStartY);

    doc.setFontSize(11);
    doc.text(`Total Supervisors Exported: ${totalSupervisors}`, 40, chartStartY + 20);

    // 📊 Bar Chart Rendering (simple)
    const maxCount = Math.max(...Object.values(zoneStats), 1); // Avoid 0
    const chartBaseX = 40;
    const barMaxWidth = 200;
    const barHeight = 12;
    const spacing = 30;
    let barY = chartStartY + 50;

    Object.entries(zoneStats).forEach(([zone, count]) => {
      const barWidth = (count / maxCount) * barMaxWidth;

      // Draw label
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`${zone}: ${count}`, chartBaseX, barY + 10);

      // Draw bar
      doc.setFillColor(255, 153, 51); // Hindalco orange
      doc.rect(chartBaseX + 60, barY, barWidth, barHeight, "F");

      barY += spacing;
    });

    // 📅 Footer
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, pageHeight - 40);

    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text(
      "© 2025 SafeVision | Powered by Hindalco — Ensuring Safety, One Zone at a Time",
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    // 🧾 Download
    doc.save("supervisors.pdf");
    toast.success("✅ Styled PDF with chart exported!", { autoClose: 1800 });
  };
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.h2
        className="text-4xl font-extrabold text-gray-800 mb-6 tracking-tight"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        👷 Supervisor Zone Assignment
      </motion.h2>

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 w-full md:w-64 rounded-md border border-gray-300 focus:ring-orange-500 focus:outline-none"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 w-full md:w-48 rounded-md border border-gray-300 focus:ring-orange-500 focus:outline-none"
        />

        <button
          onClick={exportCSV}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
        >
          📥 CSV
        </button>
        <button
          onClick={exportPDF}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
        >
          🧾 PDF
        </button>
        <button
          onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          🔁 {viewMode === "card" ? "Table View" : "Card View"}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <motion.div
            className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-16">
          No supervisors match the criteria.
        </p>
      ) : viewMode === "card" ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filtered.map((sup, i) => (
            <motion.div
              key={sup._id}
              className="p-6 bg-white shadow-2xl rounded-xl border border-gray-200 hover:shadow-orange-200 transition-all"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-5 mb-4">
                <img
                  src={sup.userAvatar?.url || "https://via.placeholder.com/150"}
                  alt={sup.firstname}
                  className="w-20 h-20 rounded-full border-2 border-orange-500 object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {sup.firstname} {sup.lastname}
                  </h3>
                  <p className="text-sm text-gray-600">{sup.email}</p>
                  <p className="text-sm text-gray-600">{sup.phone}</p>
                  <span className="text-xs mt-1 inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {sup.role}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2 text-sm">
                  Assigned Zones
                </h4>
                {zones.map((zone) => (
                  <label
                    key={zone}
                    className="flex items-center text-sm text-gray-700 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2 accent-orange-500"
                      checked={selectedZones[sup._id]?.includes(zone)}
                      onChange={() => handleZoneToggle(sup._id, zone)}
                    />
                    {zone}
                  </label>
                ))}
              </div>

              <button
                onClick={() => handleAssign(sup._id)}
                disabled={updatingId === sup._id}
                className={`w-full mt-2 px-4 py-2 text-sm rounded-md font-semibold transition duration-300 ${
                  updatingId === sup._id
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
              >
                {updatingId === sup._id ? "Saving..." : "💾 Assign Zones"}
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // TABLE VIEW
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-lg rounded-md">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="py-3 px-4">Avatar</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Zones</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sup) => (
                <tr key={sup._id} className="border-t">
                  <td className="py-3 px-4">
                    <img
                      src={
                        sup.userAvatar?.url || "https://via.placeholder.com/50"
                      }
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="py-3 px-4">
                    {sup.firstname} {sup.lastname}
                  </td>
                  <td className="py-3 px-4">{sup.email}</td>
                  <td className="py-3 px-4">{sup.phone}</td>
                  <td className="py-3 px-4">
                    {zones.map((zone) => (
                      <label key={zone} className="block text-sm">
                        <input
                          type="checkbox"
                          className="mr-2 accent-orange-500"
                          checked={selectedZones[sup._id]?.includes(zone)}
                          onChange={() => handleZoneToggle(sup._id, zone)}
                        />
                        {zone}
                      </label>
                    ))}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleAssign(sup._id)}
                      disabled={updatingId === sup._id}
                      className={`px-3 py-1 text-sm rounded-md ${
                        updatingId === sup._id
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-orange-600 hover:bg-orange-700 text-white"
                      }`}
                    >
                      {updatingId === sup._id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Supervisors;
