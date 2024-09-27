import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { protectJWT } from "../middleware/protectJWT.middleware";
import { ARequest } from "./types";

const tagsRouter = Router();

const prisma = new PrismaClient();

tagsRouter.get("/all", protectJWT, async (req: ARequest, res) => {
  try {
    const tags = await prisma.tag.findMany({});

    return res.json({
      success: true,
      message: "All tags found",
      data: tags,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

export default tagsRouter;
