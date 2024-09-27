import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";

const forSalePostAdminRouter = Router();
const prisma = new PrismaClient();

// Update Work Report with Photos
forSalePostAdminRouter.put("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, price, status } = req.body;

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
forSalePostAdminRouter.delete("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

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

export default forSalePostAdminRouter;
