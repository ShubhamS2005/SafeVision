import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Context } from "../../main"; // adjust path
import { MdCheckCircle, MdWarning } from "react-icons/md";

const Alerts = () => {
  const { user } = useContext(Context);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlertIds, setNewAlertIds] = useState([]);
  const soundRef = useRef(null);

  // Load sound effect
  useEffect(() => {
    soundRef.current = new Audio("../.././close.mp3"); // Put alert.mp3 in your public folder
  }, []);

  const fetchAlerts = async () => {
    if (!user?.assignedZones?.length) return;
    setLoading(true);

    try {
      let all = [];
      await Promise.all(
        user.assignedZones.map(async (zone) => {
          const res = await axios.get(
            `http://localhost:8000/api/v1/log/zone/${zone}`,
            { withCredentials: true }
          );
          const unresolved = res.data.logs.filter((l) => l.status === "Unresolved");
          all = [...all, ...unresolved];
        })
      );

      // Sort latest first
      all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Detect new alerts (not present in previous list)
      const prevIds = alerts.map((a) => a._id);
      const freshIds = all.map((a) => a._id).filter((id) => !prevIds.includes(id));

      if (freshIds.length > 0) {
        setNewAlertIds((prev) => [...prev, ...freshIds]);
        soundRef.current?.play().catch(() => {}); // play sound
      }

      setAlerts(all);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const markResolved = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/v1/log/resolve/${id}`, {}, { withCredentials: true });
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      setNewAlertIds((prev) => prev.filter((nid) => nid !== id));
    } catch (err) {
      console.error("Error marking resolved:", err);
    }
  };

  return (
    <div className="p-4 md:p-6 font-['Inter']">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Live Alerts</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <MdCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
          <p>No active violations in your assigned zones 🎉</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 flex flex-col ${
                  newAlertIds.includes(alert._id)
                    ? "border-red-500 animate-blink"
                    : "border-blue-500"
                }`}
              >
                {/* Image */}
                <motion.img
                  src={alert.snapshotUrl}
                  alt="PPE Violation"
                  className="h-40 object-cover w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{alert.zone}</h4>
                    <MdWarning className="text-red-500 text-2xl" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Missing: <span className="font-semibold text-red-600">{alert.ppeMissing.join(", ")}</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>

                  {/* Resolve Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => markResolved(alert._id)}
                    className="mt-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                  >
                    Mark as Resolved
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Blinking animation */}
      <style>
        {`
          @keyframes blink {
            0%, 50%, 100% { border-color: red; }
            25%, 75% { border-color: transparent; }
          }
          .animate-blink {
            animation: blink 1s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Alerts;
