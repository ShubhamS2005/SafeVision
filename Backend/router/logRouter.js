import express from "express";
import { AllLogs, ReportViolationLog,getLogStats,getLogsByDateRange,getLogsByZone, resolveLink, resolveMail} from "../controllers/logController.js";


const log_router = express.Router();

// Detection system or supervisor sends violation logs
log_router.post("/report", ReportViolationLog);

log_router.put("/resolve/:id",resolveLink);

log_router.get("/resolve/:id",resolveMail);

log_router.get("/all", AllLogs);
log_router.get("/zone/:zoneName", getLogsByZone);
log_router.get("/date", getLogsByDateRange);
log_router.get("/stats", getLogStats);
export default log_router;
