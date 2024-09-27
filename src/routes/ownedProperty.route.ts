import { OwnedProperty, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { protectJWT } from "../middleware/protectJWT.middleware";
import { ARequest } from "../types";

const ownedPropertyRouter = Router();
const prisma = new PrismaClient();

ownedPropertyRouter.get("/all", protectJWT, async (req: ARequest, res) => {
  let ownedProperties: Array<OwnedProperty> = [];

  try {
    ownedProperties = await prisma.ownedProperty.findMany({
      where: {
        member_id: req.user.id,
      },
      include: {
        Member: true,
        Property: true,
      },
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  return res.json({
    success: true,
    message: "All owned properties found",
    data: ownedProperties,
  });
});

export default ownedPropertyRouter;
