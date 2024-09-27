import { Router } from "express";
import { GalleryPhotoStatus, PrismaClient } from "@prisma/client";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import multer from "multer";
import path from "path";

const galleryPhotoAdminRouter = Router();
const prisma = new PrismaClient();

const galleryPhotoStorage = multer.diskStorage({
  destination: "public/galleryPhotos",
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
const uploadGalleryPhoto = multer({
  storage: galleryPhotoStorage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Please upload an image file"), false);
    }
    cb(null, true);
  },
}).single("galleryPhoto");

// Update Work Report with Photos
galleryPhotoAdminRouter.put("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, is_featured_photo, tagIds } = req.body;

    const galleryPhoto = await prisma.galleryPhoto.findUnique({
      where: { id: Number(id) },
    });

    if (is_featured_photo) {
      const featuredPhoto = await prisma.galleryPhoto.findFirst({
        where: {
          property_id: galleryPhoto.property_id,
          is_featured_photo: true,
        },
      });

      if (featuredPhoto) {
        await prisma.galleryPhoto.update({
          where: {
            id: featuredPhoto.id,
          },
          data: {
            is_featured_photo: false,
          },
        });
      }
    }

    const updatedGalleryPhoto = await prisma.galleryPhoto.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        is_featured_photo,

        Tags: {
          set: tagIds.map((tagId: number) => ({
            id: tagId,
          })),
        },
      },
    });

    return res.json({
      success: true,
      message: "Gallery photo updated",
      data: updatedGalleryPhoto,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Read Work Report
galleryPhotoAdminRouter.get("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const galleryPhoto = await prisma.galleryPhoto.findUnique({
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      message: "Gallery photo found",
      data: galleryPhoto,
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
galleryPhotoAdminRouter.delete(
  "/:id",
  protectJWT,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const deletedGalleryPhoto = await prisma.galleryPhoto.delete({
        where: { id: BigInt(id) },
      });

      return res.json({
        success: true,
        message: "Gallery photo deleted",
        data: deletedGalleryPhoto,
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

// Create Work Report with Photos
galleryPhotoAdminRouter.post(
  "/add",
  protectJWT,
  isAdmin,
  uploadGalleryPhoto,
  async (req, res) => {
    try {
      let { title, description, plot_number, is_featured_photo, tagIds } =
        req.body;

      tagIds = JSON.parse(tagIds);

      const file = req.file;

      const property = await prisma.property.findFirst({
        where: { plot_number },
      });

      if (property && is_featured_photo) {
        const featuredPhoto = await prisma.galleryPhoto.findFirst({
          where: {
            property_id: property.id,
            is_featured_photo: true,
          },
        });

        if (featuredPhoto) {
          await prisma.galleryPhoto.update({
            where: {
              id: featuredPhoto.id,
            },
            data: {
              is_featured_photo: false,
            },
          });
        }
      }

      const createdGalleryPhoto = await prisma.galleryPhoto.create({
        data: {
          title,
          description,
          posted_date: new Date(),
          property_id: property?.id,
          posted_user_id: req.user.id,
          filename: `/galleryPhotos/${file.filename}`,
          status: GalleryPhotoStatus.APPROVED,
          is_featured_photo: is_featured_photo == "true" ? true : false,

          Tags: {
            connect: tagIds.map((tagId: number) => ({
              id: tagId,
            })),
          },
        },
      });

      return res.json({
        success: true,
        message: "Gallery photo created",
        data: createdGalleryPhoto,
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

galleryPhotoAdminRouter.put(
  "/:id/approve",
  protectJWT,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const updatedGalleryPhoto = await prisma.galleryPhoto.update({
        where: { id: Number(id) },
        data: {
          status: GalleryPhotoStatus.APPROVED,
        },
      });

      return res.json({
        success: true,
        message: "Gallery photo approved",
        data: updatedGalleryPhoto,
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

galleryPhotoAdminRouter.put(
  "/:id/reject",
  protectJWT,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const updatedGalleryPhoto = await prisma.galleryPhoto.update({
        where: { id: Number(id) },
        data: {
          status: GalleryPhotoStatus.REJECTED,
        },
      });

      return res.json({
        success: true,
        message: "Gallery photo rejected",
        data: updatedGalleryPhoto,
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

export default galleryPhotoAdminRouter;
