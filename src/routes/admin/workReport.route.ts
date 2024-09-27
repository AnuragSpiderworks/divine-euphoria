import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import multer from "multer";
import path from "path";

const workReportRouter = Router();
const prisma = new PrismaClient();

const photoStorage = multer.diskStorage({
  destination: "public/workReportsPhotos",
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
const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Please upload an image file"), false);
    }
    cb(null, true);
  },
}).array("photos");

// Create Work Report with Photos
workReportRouter.post(
  "/",
  protectJWT,
  isAdmin,
  uploadPhoto,
  async (req, res) => {
    try {
      let { title, description, work_date, plot_number } = req.body;

      work_date = new Date(work_date);
      const files = req.files;

      let property_id = null;
      if (plot_number) {
        const property = await prisma.property.findFirst({
          where: { plot_number },
        });
        if (property) {
          property_id = property.id;
        }
      }

      const createdWorkReport = await prisma.workReport.create({
        data: {
          title,
          description,
          posted_date: new Date(),
          work_date,
          property_id,
          posted_user_id: req.user.id,
          Photos: {
            create: files.map((file) => ({
              title: file.originalname,
              filename: `/workReportsPhotos/${file.filename}`,
            })),
          },
        },
        include: {
          Photos: true,
          PostedUser: true,
          Property: true,
        },
      });

      return res.json({
        success: true,
        message: "Work report created",
        data: createdWorkReport,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  },
  (error, req, res, next) => {
    // This is the error-handling middleware function.
    // If there's an error, Multer will skip the normal middleware functions and call this function.
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    next();
  }
);

// Update Work Report with Photos
workReportRouter.put(
  "/:id",
  protectJWT,
  isAdmin,
  uploadPhoto,
  async (req, res) => {
    try {
      const { id } = req.params;
      let { title, description, plot_number, work_date } = req.body;
      work_date = new Date(work_date);
      const files = req.files;

      let property_id = null;
      if (plot_number) {
        const property = await prisma.property.findFirst({
          where: { plot_number },
        });
        if (property) {
          property_id = property.id;
        }
      }

      const updatedWorkReport = await prisma.workReport.update({
        where: { id: Number(id) },
        data: {
          title,
          description,
          work_date,
          property_id,
          posted_user_id: req.user.id,
          Photos: {
            deleteMany: {},
            create: files.map((file) => ({
              title: file.originalname,
              filename: `/workReportsPhotos/${file.filename}`,
            })),
          },
        },
        include: {
          Property: true,
        },
      });

      return res.json({
        success: true,
        message: "Work report updated",
        data: updatedWorkReport,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  },
  (error, req, res, next) => {
    // This is the error-handling middleware function.
    // If there's an error, Multer will skip the normal middleware functions and call this function.
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    next();
  }
);

// Read Work Report
workReportRouter.get("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const workReport = await prisma.workReport.findUnique({
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      data: workReport,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Delete Work Report
workReportRouter.delete("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedWorkReport = await prisma.workReport.delete({
      where: { id: BigInt(id) },
    });

    return res.json({
      success: true,
      message: "Work report deleted",
      data: deletedWorkReport,
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
