import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
  zoneName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  assignedSupervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

export const Zone = mongoose.model("Zone", zoneSchema);
