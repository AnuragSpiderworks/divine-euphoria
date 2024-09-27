import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import { ARequest } from "../../types";

const adminTagsRouter = Router();

const prisma = new PrismaClient();

adminTagsRouter.post(
  "/new",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    try {
      const { text } = req.body;

      const tag = await prisma.tag.create({
        data: {
          text,
          posted_user_id: req.user.id,
        },
      });

      return res.json({
        success: true,
        message: "Tag created",
        data: tag,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
);

adminTagsRouter.delete("/", protectJWT, isAdmin, async (req, res) => {
  try {
    const { tagIds } = req.body;

    const deletedTags = await prisma.tag.deleteMany({
      where: {
        id: {
          in: tagIds,
        },
      },
    });

    return res.json({
      success: true,
      message: "tags deleted",
      data: deletedTags,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

adminTagsRouter.delete("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTag = await prisma.tag.delete({
      where: {
        id: Number(id),
      },
    });

    return res.json({
      success: true,
      message: "Tag deleted",
      data: deletedTag,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

export default adminTagsRouter;
