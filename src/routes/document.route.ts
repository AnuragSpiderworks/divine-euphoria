import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../middleware/protectJWT.middleware";

const documentRouter = Router();
const prisma = new PrismaClient();

// Read Document
documentRouter.get("/all", protectJWT, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        posted_date: "desc",
      },
      include: {
        PostedUser: true,
      },
      where: {
        deleted: false,
      },
    });

    return res.json({
      success: true,
      message: "All documents found",
      data: documents,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default documentRouter;
