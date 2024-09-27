import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const loginHistoryRouter = Router();
const prisma = new PrismaClient();

loginHistoryRouter.get("/:memberId", async (req, res) => {
  try {
    const loginHistory = await prisma.loginHistory.findMany({
      where: { member_id: BigInt(req.params.memberId) },
      orderBy: { login_date: "desc" },
    });

    return res.json({
      success: true,
      message: "Login history retrieved",
      data: loginHistory,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default loginHistoryRouter;
