import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../middleware/protectJWT.middleware";

const workReportRouter = Router();
const prisma = new PrismaClient();

// Read All Work Reports
workReportRouter.get("/all", protectJWT, async (req, res) => {
  try {
    const workReports = await prisma.workReport.findMany({
      orderBy: {
        posted_date: "desc",
      },
      include: {
        PostedUser: true,
        Photos: true,
        Property: true,
      },
    });

    return res.json({
      success: true,
      message: "All work reports found",
      data: workReports,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default workReportRouter;
