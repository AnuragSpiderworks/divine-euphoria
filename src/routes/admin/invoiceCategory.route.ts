import { PrismaClient } from "@prisma/client";

import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { ARequest } from "../../types";
import { isAdmin } from "../../middleware/isAdmin.middleware";

const adminInvoiceCategoryRouter = Router();

const prisma = new PrismaClient();

adminInvoiceCategoryRouter.get(
  "/all",
  protectJWT,
  isAdmin,
  async (_: ARequest, res) => {
    try {
      const invoiceCategories = await prisma.invoiceCategory.findMany();

      return res.json({
        success: true,
        message: "Invoice types found",
        data: invoiceCategories,
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

// Create
adminInvoiceCategoryRouter.post(
  "/",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { name } = req.body;

    try {
      const invoiceCategory = await prisma.invoiceCategory.create({
        data: { name },
      });

      return res.json({
        success: true,
        message: "Invoice type created",
        data: invoiceCategory,
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

// Read
adminInvoiceCategoryRouter.get(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    try {
      const invoiceCategory = await prisma.invoiceCategory.findUnique({
        where: { id: BigInt(id) },
      });

      if (!invoiceCategory) {
        return res.status(404).json({
          success: false,
          message: "Invoice type not found",
          data: null,
        });
      }

      return res.json({
        success: true,
        message: "Invoice type found",
        data: invoiceCategory,
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

// Update
adminInvoiceCategoryRouter.put(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
      const invoiceCategory = await prisma.invoiceCategory.update({
        where: { id: BigInt(id) },
        data: { name },
      });

      return res.json({
        success: true,
        message: "Invoice type updated",
        data: invoiceCategory,
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

// Delete
adminInvoiceCategoryRouter.delete(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    try {
      const invoiceCategory = await prisma.invoiceCategory.delete({
        where: { id: BigInt(id) },
      });

      return res.json({
        success: true,
        message: "Invoice type deleted",
        data: invoiceCategory,
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

export default adminInvoiceCategoryRouter;
