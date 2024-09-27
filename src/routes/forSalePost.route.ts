import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../middleware/protectJWT.middleware";
import { ARequest } from "./types";

const forSalePostRouter = Router();
const prisma = new PrismaClient();

forSalePostRouter.get("/all", protectJWT, async (req, res) => {
  try {
    const forSalePosts = await prisma.forSalePost.findMany({
      include: {
        OwnedProperty: {
          include: {
            Property: {
              include: {
                GalleryPhotos: true,
              },
            },
          },
        },
        PostedMember: true,
      },
    });

    return res.json({
      success: true,
      message: "For Sale posts found",
      data: forSalePosts,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Create Work Report with Photos
forSalePostRouter.post("/add", protectJWT, async (req, res) => {
  try {
    let { title, description, plot_number, price, status } = req.body;

    const property = await prisma.property.findFirst({
      where: { plot_number },
      include: {
        OwnedProperties: true,
      },
    });

    if (!property || property.OwnedProperties.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No owned property found for the given plot number",
        data: null,
      });
    }

    const ownedProperty = property.OwnedProperties.find(
      (ownedProperty) => ownedProperty.ownership_status === "OWNER"
    );

    if (!ownedProperty) {
      return res.status(400).json({
        success: false,
        message:
          "No owned property with status OWNER found for the given plot number",
        data: null,
      });
    }

    const createdforSalePost = await prisma.forSalePost.create({
      data: {
        owned_property_id: ownedProperty.id,
        posted_member_id: req.user.id,
        posted_date: new Date(),
        price,
        title,
        description,
        status,
      },
    });

    return res.json({
      success: true,
      message: "For sale post created",
      data: createdforSalePost,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Update Work Report with Photos
forSalePostRouter.put("/:id", protectJWT, async (req: ARequest, res) => {
  try {
    const { id } = req.params;
    let { title, description, price, status } = req.body;

    const forSalePost = await prisma.forSalePost.findUnique({
      where: { id: Number(id) },
    });

    if (req.user.id != forSalePost.posted_member_id) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to update this post",
        data: null,
      });
    }

    const updatedForSalePost = await prisma.forSalePost.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        price,
        status,
      },
    });

    return res.json({
      success: true,
      message: "For sale post updated",
      data: updatedForSalePost,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

forSalePostRouter.put("/:id", protectJWT, async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, price, status } = req.body;

    const forSalePost = await prisma.forSalePost.findUnique({
      where: { id: Number(id) },
    });

    if (req.user.id != forSalePost.posted_member_id) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to update this post",
        data: null,
      });
    }

    const updatedForSalePost = await prisma.forSalePost.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        price,
        status,
      },
    });

    return res.json({
      success: true,
      message: "For sale post updated",
      data: updatedForSalePost,
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
forSalePostRouter.delete("/:id", protectJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const forSalePost = await prisma.forSalePost.findUnique({
      where: { id: Number(id) },
    });

    if (req.user.id != forSalePost.posted_member_id) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to delete this post",
        data: null,
      });
    }

    const deletedForSalePost = await prisma.forSalePost.delete({
      where: { id: BigInt(id) },
    });

    return res.json({
      success: true,
      message: "For sale post deleted",
      data: deletedForSalePost,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default forSalePostRouter;
