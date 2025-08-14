import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiTrash2,
  FiFileText,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "In Progress": "bg-blue-100 text-blue-800 border border-blue-300",
  Resolved: "bg-green-100 text-green-800 border border-green-300",
};

const Feedback = () => {
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's feedback
  const fetchFeedback = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/feedback/my", {
        withCredentials: true,
      });
      setFeedbackList(res.data.feedback || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Handle file selection
  const handleFiles = (files) => {
    const validFiles = [];
    let oversizedFound = false;

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFound = true;
      } else {
        validFiles.push({
          file,
          preview: file.type.includes("image")
            ? URL.createObjectURL(file)
            : null,
          isPDF: file.type === "application/pdf",
        });
      }
    });

    if (oversizedFound) {
      toast.error(
        "One or more files exceed 10MB. Please upload smaller files or upgrade your plan."
      );
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  // Drag & drop upload
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  // Remove file before submit
  const removeFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (attachments.length === 0) {
      toast.error("Please attach at least one file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", type);
      formData.append("message", message);
      attachments.forEach((att) => {
        formData.append("attachments", att.file);
      });

      await axios.post(
        "http://localhost:8000/api/v1/feedback/submit",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Feedback submitted successfully");
      setType("");
      setMessage("");
      setAttachments([]);
      fetchFeedback();
    } catch (err) {
      console.error(err);
      const cloudErr = err.response?.data?.error?.message;
      if (cloudErr && cloudErr.includes("Maximum is 10485760")) {
        toast.error(
          "File size too large (max 10MB on free plan). Please resize or compress before uploading."
        );
      } else {
        toast.error(err.response?.data?.message || "Failed to submit feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-['Inter'] bg-gradient-to-tr from-gray-50 via-white to-gray-100 min-h-screen">
      {/* Form title */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 mb-6"
      >
        <FiMessageCircle className="text-blue-600 text-3xl" />
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Submit Feedback
        </h2>
      </motion.div>

      {/* Feedback Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-md p-6 mb-10 border border-gray-200"
      >
        {/* Type selector */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Feedback Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-gray-700 focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select Type</option>
          <option value="Bug">Bug</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Safety Issue">Safety Issue</option>
          <option value="Other">Other</option>
        </select>

        {/* Message */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-gray-700 focus:ring-2 focus:ring-blue-300"
          placeholder="Describe your feedback..."
        ></textarea>

        {/* File upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center mb-4 cursor-pointer hover:bg-blue-50 transition relative"
        >
          <FiUploadCloud className="text-3xl text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">
            Drag & drop files here, or click to upload
          </p>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => handleFiles(Array.from(e.target.files))}
          />
        </div>

        {/* Preview selected files */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            {attachments.map((att, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
              >
                {att.preview ? (
                  <img
                    src={att.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiFileText className="text-gray-500 text-3xl" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <FiTrash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FiSend />
          {loading ? "Submitting..." : "Submit Feedback"}
        </motion.button>
      </motion.form>

      {/* My Feedback List */}
      {/* My Feedback List - Industrial Timeline */}
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-lg font-semibold text-gray-800 mb-6"
      >
        📜 My Feedback History
      </motion.h3>

      <div className="relative">
        {/* Timeline vertical line with draw animation */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute left-4 top-0 w-[2px] bg-gradient-to-b from-gray-300 to-gray-500 rounded-full"
        ></motion.div>

        <div className="pl-12 space-y-8">
          {feedbackList.map((fb, index) => {
            const isLatest = index === 0;
            const statusDotColor =
              fb.status === "Resolved"
                ? "bg-green-500"
                : fb.status === "In Progress"
                ? "bg-yellow-500"
                : "bg-red-500";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative"
              >
                {/* Timeline dot */}
                <span
                  className={`absolute left-4 top-2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md ${statusDotColor} ${
                    isLatest ? "animate-ping-once" : ""
                  }`}
                ></span>

                {/* Feedback Card */}
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800">{fb.type}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[fb.status]
                      }`}
                    >
                      {fb.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {fb.message}
                  </p>

                  {/* Attachments */}
                  {fb.attachments?.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {fb.attachments.map((file, i) => {
                        const isPDF =
                          file.url.toLowerCase().endsWith(".pdf") ||
                          file.url.includes("/raw/");
                        return isPDF ? (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-md border border-red-200 hover:bg-red-100 transition"
                          >
                            <FiFileText /> PDF {i + 1}
                          </a>
                        ) : (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-16 h-16 overflow-hidden rounded border border-gray-200 hover:scale-105 transition"
                          >
                            <img
                              src={file.url}
                              alt={`Attachment ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(fb.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
