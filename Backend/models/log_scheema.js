import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  zone: {
    type: String,
    required: true,
  },
  ppeMissing: {
    type: [String], // e.g. ["helmet", "gloves"]
    required: true,
  },
  snapshotUrl: {
    type: String, // Cloudinary or local path
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Supervisor or system
    required: false,
  },
  status: {
    type: String,
    enum: ["Unresolved", "Resolved"],
    default: "Unresolved",
  },
});

export const ViolationLog = mongoose.model("ViolationLog", logSchema);
