import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../middleware/protectJWT.middleware";

const contactRouter = Router();
const prisma = new PrismaClient();

// Read Contact
contactRouter.get("/all", protectJWT, async (req, res) => {
  try {
    const contact = await prisma.contact.findMany({
      orderBy: {
        display_sequence: "asc",
      },
    });

    return res.json({
      success: true,
      message: "Contact fetched",
      data: contact,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default contactRouter;
