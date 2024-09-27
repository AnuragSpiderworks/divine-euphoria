import { Router } from "express";
import { GalleryPhotoStatus, PrismaClient } from "@prisma/client";
import { protectJWT } from "../middleware/protectJWT.middleware";
import multer from "multer";
import path from "path";

const galleryPhotoRouter = Router();
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

galleryPhotoRouter.get("/all", protectJWT, async (req, res) => {
  try {
    const galleryPhotos = await prisma.galleryPhoto.findMany({
      include: {
        Property: true,
        Member: true,
        Tags: true,
      },
    });

    return res.json({
      success: true,
      message: "Gallery photos found",
      data: galleryPhotos,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

galleryPhotoRouter.post(
  "/add",
  protectJWT,
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
          status: GalleryPhotoStatus.NEW,
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

// Delete Work Report
galleryPhotoRouter.delete("/:id", protectJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const galleryPhoto = await prisma.galleryPhoto.findUnique({
      where: { id: BigInt(id) },
    });

    if (req.user.id != galleryPhoto.posted_user_id) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to delete this photo",
        data: null,
      });
    }

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
});

export default galleryPhotoRouter;
