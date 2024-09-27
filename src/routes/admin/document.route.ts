import multer from "multer";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import path from "path";

const documentRouter = Router();
const prisma = new PrismaClient();

const documentStorage = multer.diskStorage({
  destination: "public/documents",
  filename: function (req, file, cb) {
    cb(
      null,
      req.user.name.replace(/ /g, "_") +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const uploadDocument = multer({ storage: documentStorage }).single("document");

// Create Document
documentRouter.post(
  "/",
  protectJWT,
  isAdmin,
  uploadDocument,
  async (req, res) => {
    try {
      const { title } = req.body;

      let file_name_url = "";

      if (req.file) {
        file_name_url = `/documents/${req.file.filename}`;
      } else {
        throw new Error("No file uploaded");
      }

      const createdDocument = await prisma.document.create({
        data: {
          title,
          file_name_url,
          posted_user_id: req.user.id,
          posted_date: new Date(),
        },
      });

      return res.json({
        success: true,
        message: "Document created",
        data: createdDocument,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }
);

// Read Document
documentRouter.get("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      data: document,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Update Document
documentRouter.put("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const document = await prisma.document.update({
      where: { id: Number(id) },
      data: {
        title,
        posted_user_id: req.user.id,
      },
    });

    return res.json({
      success: true,
      message: "Document updated",
      data: document,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Delete Document
documentRouter.delete("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.update({
      data: {
        deleted: true,
      },
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      message: "Document deleted",
      data: document,
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
