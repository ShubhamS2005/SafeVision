import express from "express";
import {
  CreateZone,
  GetAllZones,
  AssignSupervisor
} from "../controllers/zoneController.js";

import { isAdminAuthenticated} from "../middleware/auth.js";

const zone_router = express.Router();

const restrictTo = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: `Access denied: ${role}s only.` });
  }
  next();
};

zone_router.post("/create", isAdminAuthenticated, CreateZone);
zone_router.get("/all", isAdminAuthenticated, GetAllZones);
zone_router.put("/assign/:zoneId", isAdminAuthenticated, AssignSupervisor);

export default zone_router;
