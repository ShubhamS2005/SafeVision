import express from "express";
import {
  UserRegister,
  login,
  GetUser,
  AdminLogout,
  SupervisorLogout,
  AddNewUser,
  UpdateElementId,
  getAllSupervisors,
  assignZonesToSupervisor
} from "../controllers/userController.js";

import { isAdminAuthenticated,isSupervisorAuthenticated } from "../middleware/auth.js";

const user_router = express.Router();


// ✅ Common Routes
user_router.post("/register", UserRegister); // Optional — if allowed
user_router.post("/login", login);
user_router.get("/admin/me", isAdminAuthenticated, GetUser);

user_router.get("/supervisor/me", isSupervisorAuthenticated, GetUser);

// ✅ Admin-Only Routes
user_router.post("/admin/add-user", isAdminAuthenticated, AddNewUser);
user_router.get("/admin/supervisors", isAdminAuthenticated,getAllSupervisors);
user_router.put("/admin/update-user/:id", isAdminAuthenticated,UpdateElementId);
user_router.get("/admin/logout", isAdminAuthenticated,AdminLogout);
user_router.put("/admin/assign-zones/:id", isAdminAuthenticated, assignZonesToSupervisor);


// ✅ Supervisor-Only Routes
user_router.get("/supervisor/logout", isSupervisorAuthenticated ,SupervisorLogout);


// (Optionally add more Supervisor routes here)

export default user_router;
