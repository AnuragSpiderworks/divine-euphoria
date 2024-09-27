import { PrismaClient } from "@prisma/client";

import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import {
  ARequest,
  CreatePropertyDTO,
  Property,
  UpdatePropertyDTO,
} from "../../types";
import { isAdmin } from "../../middleware/isAdmin.middleware";

const adminPropertyRouter = Router();

const prisma = new PrismaClient();

adminPropertyRouter.get(
  "/all",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
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
  }
);

adminPropertyRouter.get(
  "/available",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    let properties: Array<Property> = [];

    try {
      properties = await prisma.property.findMany({
        include: {
          OwnedProperties: true,
          Invoices: true,
          WorkReports: true,
          AuditLogs: true,
          GalleryPhotos: true,
          _count: true,
        },
      });

      properties = properties.filter((property) => {
        return property.OwnedProperties?.some(
          (ownedProperty) => ownedProperty.ownership_status == "OWNER"
        );
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
      message: "All available properties found",
      data: properties,
    });
  }
);

adminPropertyRouter.post(
  "/",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    let property: CreatePropertyDTO;
    const propertyData: CreatePropertyDTO = req.body;

    try {
      property = await prisma.property.create({
        data: propertyData,
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
      message: "Property created",
      data: property,
    });
  }
);

adminPropertyRouter.put(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    const updateData: UpdatePropertyDTO = req.body;

    let property: UpdatePropertyDTO;

    try {
      if(updateData.area){
        updateData.area = parseFloat(updateData.area as unknown as string)
      }
      property = await prisma.property.update({
        where: { id: BigInt(id) },
        data: updateData,
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
      message: "Property updated",
      data: property,
    });
  }
);

export default adminPropertyRouter;
