import { Zone } from "../models/zone_scheema.js";
import { catchAsyncErrors } from "../middleware/CatchAssyncErrors.js";
import ErrorHandler from "../middleware/errormiddleware.js";

// Create new zone (admin only)
export const CreateZone = catchAsyncErrors(async (req, res, next) => {
  const { zoneName, description } = req.body;

  const existing = await Zone.findOne({ zoneName });
  if (existing) {
    return next(new ErrorHandler("Zone with this name already exists", 400));
  }

  const zone = await Zone.create({ zoneName, description });

  res.status(201).json({
    success: true,
    message: "Zone created successfully",
    zone,
  });
});

// Get all zones
export const GetAllZones = catchAsyncErrors(async (req, res, next) => {
  const zones = await Zone.find().populate("assignedSupervisor", "firstname lastname email");
  res.status(200).json({
    success: true,
    zones,
  });
});

// Assign supervisor to a zone
export const AssignSupervisor = catchAsyncErrors(async (req, res, next) => {
  const { zoneId } = req.params;
  const { supervisorId } = req.body;

  const zone = await Zone.findById(zoneId);
  if (!zone) return next(new ErrorHandler("Zone not found", 404));

  zone.assignedSupervisor = supervisorId;
  await zone.save();

  res.status(200).json({
    success: true,
    message: "Supervisor assigned to zone",
    zone,
  });
});
