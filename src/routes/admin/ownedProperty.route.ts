import { OwnedProperty, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { ARequest } from "../types";
import { isAdmin } from "../../middleware/isAdmin.middleware";

const adminOwnedPropertyRouter = Router();
const prisma = new PrismaClient();

adminOwnedPropertyRouter.get(
  "/all",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    let ownedProperties: Array<OwnedProperty> = [];

    try {
      ownedProperties = await prisma.ownedProperty.findMany({
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
  }
);

adminOwnedPropertyRouter.post(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    const {
      plot_number,
      ownership_status,
      date_of_agreement,
      date_of_registration,
    } = req.body;

    // Get the id of the property with that plot_number
    const property = await prisma.property.findFirst({
      where: {
        plot_number: plot_number,
      },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
        data: null,
      });
    }

    const property_id = property.id;

    try {
      // Create a new OwnedProperty record
      const newProperty = await prisma.ownedProperty.create({
        data: {
          member_id: BigInt(id),
          property_id: BigInt(property_id),
          date_of_agreement: date_of_agreement,
          date_of_registration: date_of_registration,
          ownership_status: ownership_status,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          property_id: BigInt(property_id),
          action: "CREATE",
          table: "OWNED_PROPERTY",
          performed_member_id: req.user.id,
          target_member_id: newProperty.member_id,
          old_value: null,
          new_value: JSON.stringify(newProperty),
        },
      });

      res.json({
        success: true,
        message: "Property assigned to the user",
        data: newProperty,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Something went wrong",
        data: null,
      });
    }
  }
);

adminOwnedPropertyRouter.put(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    const { date_of_agreement, date_of_registration, ownership_status } =
      req.body;

    try {
      const oldOwnedProperty = await prisma.ownedProperty.findUnique({
        where: { id: BigInt(id) },
      });

      const ownedProperty = await prisma.ownedProperty.update({
        where: { id: BigInt(id) },
        data: {
          date_of_agreement,
          date_of_registration,
          ownership_status,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          property_id: BigInt(ownedProperty.property_id),
          action: "UPDATE",
          table: "OWNED_PROPERTY",
          performed_member_id: req.user.id,
          target_member_id: ownedProperty.member_id,
          old_value: JSON.stringify(oldOwnedProperty),
          new_value: JSON.stringify(ownedProperty),
        },
      });

      return res.json({
        success: true,
        message: "Owned property updated",
        data: ownedProperty,
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

adminOwnedPropertyRouter.delete(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    try {
      const ownedProperty =
        (await prisma.ownedProperty.findUnique({
          where: { id: BigInt(id) },
        })) ?? null;

      await prisma.forSalePost.deleteMany({
        where: {
          owned_property_id: BigInt(id),
        },
      });

      await prisma.ownedProperty.delete({
        where: { id: BigInt(id) },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          property_id: BigInt(ownedProperty.property_id),
          action: "DELETE",
          table: "OWNED_PROPERTY",
          performed_member_id: req.user.id,
          target_member_id: ownedProperty.member_id,
          old_value: JSON.stringify(ownedProperty),
          new_value: null,
        },
      });

      return res.json({
        success: true,
        message: "Owned property deleted",
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

export default adminOwnedPropertyRouter;
