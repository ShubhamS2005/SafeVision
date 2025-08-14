import { ViolationLog } from "../models/log_scheema.js";
import { catchAsyncErrors } from "../middleware/CatchAssyncErrors.js";
import ErrorHandler from "../middleware/errormiddleware.js";
import { User } from "../models/user_scheema.js";

import { config } from "dotenv";
import { Resend } from "resend";
config({ path: "./config/config.env" });

const resend = new Resend(process.env.RESEND_API_KEY);

export const ReportViolationLog = async (req, res) => {
  try {
    const { zone, ppeMissing, snapshotUrl } = req.body;

    const log = await ViolationLog.create({
      zone,
      ppeMissing,
      snapshotUrl,
      timestamp: new Date(),
    });

    const supervisors = await User.find({
      role: "Supervisor",
      assignedZones: { $in: [zone] },
    });

    if (supervisors.length > 0) {
      const supervisorEmails = supervisors.map((s) => s.email);
      const resolveLink = `http://localhost:8000/api/v1/log/resolve/${log._id}`;

      // Send email via Resend
      await resend.emails.send({
        from: "SafeVision <alerts@resend.dev>",
        to: supervisorEmails,
        subject: `🚨 PPE Violation Detected in ${zone}`,
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>PPE Violation Alert</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.06);
        }
        .header {
          background-color: #e74c3c;
          padding: 10px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header img {
          height: 20px;
        }
        .content {
          padding: 24px;
        }
        .content h2 {
          margin-top: 0;
        }
        .content p {
          line-height: 1.6;
        }
        .ppe-list {
          background-color: #f2dede;
          padding: 10px;
          border-radius: 4px;
          color: #a94442;
          font-weight: 500;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PPE Violation Alert</h1>
        </div>
        <div class="content">
          <h2>Violation Detected</h2>
          <p><strong>Zone:</strong> ${zone}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Missing PPE:</strong></p>
          <div class="ppe-list">${ppeMissing.join(", ")}</div>
          <p>
            A snapshot of the violation has been captured and logged. Please review and take appropriate action.
          </p>
          <p>Click the button below to mark this violation as resolved:</p>
           <a href="${resolveLink}"
            style="background: linear-gradient(to right, #4caf50, #81c784); padding: 12px 18px; border-radius: 6px; color: white; text-decoration: none; font-weight: bold;">
            Resolve This Violation
          </a>

          <p>
            <a href="${snapshotUrl}" target="_blank">View Snapshot</a>
          </p>
          <p>
            <img src="${snapshotUrl}" alt="Snapshot" style="max-width: 100%; border-radius: 8px;" />
          </p>

        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Hindalco Industries. All rights reserved.<br />
          SafeVision Alert System – Created By Shubham Srivastava
        </div>
      </div>
    </body>
    </html>
  `,
      });

      console.log("Email Send");
    }
    res.status(201).json({ success: true, log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Violation not logged." });
  }
};

export const getLogsByZone = catchAsyncErrors(async (req, res, next) => {
  const zone = req.params.zoneName.trim();

  const logs = await ViolationLog.find({ zone: zone });

  if (!logs || logs.length === 0) {
    return next(new ErrorHandler("No logs found for this zone", 404));
  }
  res.status(200).json({
    success: true,
    count: logs.length,
    logs,
  });
});

export const AllLogs = catchAsyncErrors(async (req, res, next) => {
  const logs = await ViolationLog.find();

  if (!logs || logs.length === 0) {
    return next(new ErrorHandler("No logs found for this zone", 404));
  }
  res.status(200).json({
    success: true,
    count: logs.length,
    logs,
  });
});

export const getLogsByDateRange = catchAsyncErrors(async (req, res, next) => {
  const { from, to, page = 1, limit = 10 } = req.query;

  if (!from || !to) {
    return next(new ErrorHandler("From and To dates are required", 400));
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999); // End of 'to' day

  const skip = (page - 1) * limit;

  const logs = await ViolationLog.find({
    timestamp: { $gte: fromDate, $lte: toDate },
  })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalLogs = await ViolationLog.countDocuments({
    timestamp: { $gte: fromDate, $lte: toDate },
  });

  res.status(200).json({
    success: true,
    totalLogs,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalLogs / limit),
    logs,
  });
});

export const getLogStats = catchAsyncErrors(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const violationsToday = await ViolationLog.countDocuments({
    timestamp: { $gte: today },
  });

  const totalLogs = await ViolationLog.countDocuments();

  res.status(200).json({
    success: true,
    stats: {
      totalLogs,
      violationsToday,
    },
  });
});

export const resolveMail = catchAsyncErrors(async (req, res, next) => {
  try {
    const logId = req.params.id;

    const log = await ViolationLog.findById(logId);
    if (!log) {
      return next(new ErrorHandler("Violation not found.", 400));
    }

    if (log.status === "Resolved") {
      return next(new ErrorHandler("Violation already resolved.", 400));
    }
    await ViolationLog.findByIdAndUpdate(logId, { status: "Resolved" });

    // Respond with a user-friendly HTML page
    res.send(`
    <html>
      <head><title>Violation Resolved</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Violation Marked as Resolved</h1>
        <p>Log ID: ${logId}</p>
      </body>
    </html>
  `);
  } catch (err) {
    console.error("Error resolving violation:", err.message);
    return next(new ErrorHandler("Internal Server Error.", 500));
  }
});

// In your log_router


export const resolveLink = catchAsyncErrors(async (req, res, next) => {
  try {
    const logId = req.params.id;
    const log = await ViolationLog.findById(logId);
    if (!log) {
      return next(new ErrorHandler("Violation not found.", 404));
    }
    if (log.status === "Resolved") {
      return res.status(400).json({ success: false, message: "Violation already resolved" });
    }
    log.status = "Resolved";
    await log.save();
    res.json({ success: true, message: "Violation marked as resolved", logId });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});