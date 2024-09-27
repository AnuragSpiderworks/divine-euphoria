import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import { ARequest } from "../../types";

const adminNotesRouter = Router();

const prisma = new PrismaClient();

adminNotesRouter.post(
  "/new",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    try {
      const { target_member_id, content } = req.body;

      const note = await prisma.note.create({
        data: {
          target_member_id,
          posted_member_id: req.user.id,
          content,
        },
      });

      return res.json({
        success: true,
        message: "Note created",
        data: note,
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

adminNotesRouter.get("/all", async (req, res) => {
  try {
    // Get start_date and end_date as params
    const { start_date, end_date } = req.query;

    let notes;
    if (
      isNaN(Date.parse(start_date as string)) ||
      isNaN(Date.parse(end_date as string))
    ) {
      notes = await prisma.note.findMany({
        include: {
          TargetMember: true,
          PostedMember: true,
        },
      });
    } else {
      notes = await prisma.note.findMany({
        include: {
          TargetMember: true,
          PostedMember: true,
        },
        where: {
          posted_date: {
            gte: new Date(start_date as string),
            lte: new Date(end_date as string),
          },
        },
      });
    }

    return res.json({
      success: true,
      message: "All notes found",
      data: notes,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

adminNotesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        TargetMember: true,
        PostedMember: true,
      },
    });

    return res.json({
      success: true,
      message: "Note found",
      data: note,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

adminNotesRouter.put("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
      },
    });

    // Check if note has been posted for longer than 24 hours
    const now = new Date();
    const postedDate = new Date(note?.posted_date);
    const diff = now.getTime() - postedDate.getTime();
    const diffHours = diff / (1000 * 3600);
    if (diffHours > 24) {
      return res.status(400).json({
        success: false,
        message: "Note can't be updated after 24 hours",
        data: null,
      });
    }

    const updatedNote = await prisma.note.update({
      where: {
        id: Number(id),
      },
      data: {
        content,
      },
    });

    return res.json({
      success: true,
      message: "Note updated",
      data: updatedNote,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

adminNotesRouter.delete("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
      },
    });

    // Check if note has been posted for longer than 24 hours
    const now = new Date();
    const postedDate = new Date(note?.posted_date);
    const diff = now.getTime() - postedDate.getTime();
    const diffHours = diff / (1000 * 3600);
    if (diffHours > 24) {
      return res.status(400).json({
        success: false,
        message: "Note can't be deleted after 24 hours",
        data: null,
      });
    }

    const deletedNote = await prisma.note.delete({
      where: {
        id: Number(id),
      },
    });

    return res.json({
      success: true,
      message: "Note deleted",
      data: deletedNote,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
});

export default adminNotesRouter;
