import { PrismaClient, Property } from "@prisma/client";
import { Router } from "express";
import { protectJWT } from "../middleware/protectJWT.middleware";
import { ARequest } from "../types";

const propertyRouter = Router();
const prisma = new PrismaClient();

propertyRouter.get("/owned", protectJWT, async (req: ARequest, res) => {
  let properties: Array<Property> = [];

  try {
    const allProperties = await prisma.property.findMany({
      include: {
        OwnedProperties: {
          include: {
            Member: true,
          },
        },
        Invoices: true,
        WorkReports: true,
        AuditLogs: true,
        GalleryPhotos: true,
        _count: true,
      },
    });

    properties = allProperties.filter((property) =>
      property.OwnedProperties.some(
        (ownedProperty) => ownedProperty.member_id === req.user.id
      )
    );
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  return res.json({
    success: true,
    message: "All properties found",
    data: properties,
  });
});

propertyRouter.get("/all", protectJWT, async (req: ARequest, res) => {
  let properties: Array<Property> = [];

  try {
    properties = await prisma.property.findMany({
      include: {
        OwnedProperties: {
          include: {
            Member: true,
          },
        },
        Invoices: true,
        WorkReports: true,
        AuditLogs: true,
        GalleryPhotos: true,
        _count: true,
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
    message: "All properties found",
    data: properties,
  });
});

export default propertyRouter;
