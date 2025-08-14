import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const zones = ["Zone A", "Zone B", "Zone C"];

const AddUser = () => {
  const [userAvatar, setUserAvatar] = useState(null);
  const [userAvatarPreview, setUserAvatarPreview] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Supervisor");
  const [assignedZones, setAssignedZones] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setUserAvatarPreview(reader.result);
      setUserAvatar(file);
    };
  };

  const handleZoneChange = (zone) => {
    setAssignedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const resetForm = () => {
    setUserAvatar(null);
    setUserAvatarPreview(null);
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("Supervisor");
    setAssignedZones([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userAvatar) {
      toast.error("Please upload an avatar.");
      return;
    }

    const formData = new FormData();
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("userAvatar", userAvatar);
    formData.append("role", role);

    if (role === "Supervisor") {
      formData.append("assignedZones", JSON.stringify(assignedZones));
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/admin/add-user",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data.message);
      setShowSuccess(true);
      resetForm();

      // Optional redirect after short delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/admin/supervisors");
      }, 1800);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to add user.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-white px-6 py-12">
      <motion.div
        className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl px-10 py-10 space-y-10"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-4xl font-extrabold text-orange-600 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ➕ Add New {role}
        </motion.h2>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              key="success"
              className="flex justify-center items-center gap-4 p-4 bg-green-100 rounded-xl shadow-inner"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaCheckCircle className="text-green-600 text-3xl" />
              <p className="text-green-700 font-semibold text-lg">
                User successfully added!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Avatar Upload */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                User Avatar <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-white file:bg-orange-600 hover:file:bg-orange-700"
              />
            </div>
            {userAvatarPreview && (
              <motion.img
                src={userAvatarPreview}
                alt="Preview"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full shadow-lg border-4 border-orange-500 object-cover"
              />
            )}
          </div>

          {/* Input Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "First Name", value: firstname, setValue: setFirstname },
              { label: "Last Name", value: lastname, setValue: setLastname },
              { label: "Email", value: email, setValue: setEmail },
              { label: "Phone", value: phone, setValue: setPhone },
              { label: "Password", value: password, setValue: setPassword, type: "password" },
            ].map(({ label, value, setValue, type = "text" }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </motion.div>
            ))}

            {/* Role Dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="Supervisor">Supervisor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Zones */}
          {role === "Supervisor" && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-sm font-semibold text-gray-700">
                Assign Zones:
              </label>
              <div className="flex gap-4 flex-wrap">
                {zones.map((zone) => (
                  <label
                    key={zone}
                    className="flex items-center gap-2 text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={assignedZones.includes(zone)}
                      onChange={() => handleZoneChange(zone)}
                      className="accent-orange-600 h-4 w-4"
                    />
                    {zone}
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-6 pt-6">
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all"
            >
               Add {role}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg border transition"
            >
               Reset Form
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddUser;
