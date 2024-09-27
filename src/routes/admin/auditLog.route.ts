import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const auditLogRouter = Router();
const prisma = new PrismaClient();

auditLogRouter.get("/", async (req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        PerformedMember: true,
        TargetMember: true,
        Property: true,
      },
    });

    return res.json({
      success: true,
      message: "Audit logs retrieved",
      data: auditLogs,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default auditLogRouter;
