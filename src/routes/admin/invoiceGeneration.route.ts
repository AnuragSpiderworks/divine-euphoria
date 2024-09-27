import { PrismaClient } from "@prisma/client";

import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { ARequest } from "../../types";
import { isAdmin } from "../../middleware/isAdmin.middleware";
// import transporter from "../../config/mailer";

const adminInvoiceGenerationRouter = Router();

const prisma = new PrismaClient();

// Get all
adminInvoiceGenerationRouter.get(
  "/all",
  protectJWT,
  isAdmin,
  async (_: ARequest, res) => {
    try {
      const invoiceGenerations = await prisma.invoiceGeneration.findMany({
        include: {
          Category: true,
        },
      });

      return res.json({
        success: true,
        message: "Invoice generations found",
        data: invoiceGenerations,
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
adminInvoiceGenerationRouter.post(
  "/",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const {
      invoice_category_name,
      creator_id,
      code,
      title,
      remarks,
      type,
      amount,
      rate,
      date,
    } = req.body;

    try {
      const category = await prisma.invoiceCategory.findFirst({
        where: { name: invoice_category_name },
      });

      const category_id = category?.id;

      if (type === "PER_MEMBER") {
        const members = await prisma.member.findMany({
          include: {
            OwnedProperties: true,
          },
          where: {
            role: {
              not: "INACTIVE",
            },
          },
        });
        for (const member of members) {
          if (member.OwnedProperties.length > 0) {
            const invoiceTitle = title + `_${member.name}_${member.id}`;
            await prisma.invoice.create({
              data: {
                member_id: member.id,
                category_id: category_id,
                code: code,
                title: invoiceTitle,
                remarks: remarks,
                amount: amount,
                date: date,
              },
            });

            //           const mailOptions = {
            //             from: process.env.MAILER_EMAIL,
            //             to: member.email,
            //             subject: "Invoice Generated",
            //             html: `
            //   <ul>
            //     <li>Member: ${member.name}</li>
            //     <li>Category: ${category.name}</li>
            //     <li>Code: ${code}</li>
            //     <li>Title: ${invoiceTitle}</li>
            //     <li>Remarks: ${remarks}</li>
            //     <li>Amount: ${amount}</li>
            //     <li>Date: ${date}</li>
            //   </ul>
            // `,
            //           };

            // transporter.sendMail(mailOptions, (err, info) => {
            //   if (err) {
            //     throw new Error(err.message);
            //   }
            // });
          }
        }
      } else if (type === "PER_PROPERTY") {
        const ownedProperties = await prisma.ownedProperty.findMany({
          include: {
            Member: true,
            Property: true,
          },
        });
        for (const ownedProperty of ownedProperties) {
          const invoiceTitle = title + `_${ownedProperty.Property.plot_number}`;

          await prisma.invoice.create({
            data: {
              member_id: ownedProperty.Member.id,
              category_id: category_id,
              property_id: ownedProperty.property_id,
              code: code,
              title: invoiceTitle,
              remarks: remarks,
              rate: rate,
              date: date,
            },
          });

          //         const mailOptions = {
          //           from: process.env.MAILER_EMAIL,
          //           to: ownedProperty.Member.email,
          //           subject: "Invoice Generated",
          //           html: `
          //   <ul>
          //     <li>Member: ${ownedProperty.Member.name}</li>
          //     <li>Category: ${category.name}</li>
          //     <li>Code: ${code}</li>
          //     <li>Title: ${invoiceTitle}</li>
          //     <li>Remarks: ${remarks}</li>
          //     <li>Rate: ${rate}</li>
          //     <li>Date: ${date}</li>
          //   </ul>
          // `,
          //         };

          // transporter.sendMail(mailOptions, (err, info) => {
          //   if (err) {
          //     throw new Error(err.message);
          //   }
          // });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid type",
          data: null,
        });
      }

      const invoiceGeneration = await prisma.invoiceGeneration.create({
        data: {
          category_id,
          creator_id,
          code,
          title,
          remarks,
          type,
          amount,
          rate,
          date,
          status: "ACTIVE",
        },
      });

      return res.json({
        success: true,
        message: "Invoice generation created",
        data: invoiceGeneration,
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
adminInvoiceGenerationRouter.get(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    try {
      const invoiceGeneration = await prisma.invoiceGeneration.findUnique({
        where: { id: BigInt(id) },
      });

      if (!invoiceGeneration) {
        return res.status(404).json({
          success: false,
          message: "Invoice generation not found",
          data: null,
        });
      }

      return res.json({
        success: true,
        message: "Invoice generation found",
        data: invoiceGeneration,
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
adminInvoiceGenerationRouter.put(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    const {
      category_id,
      creator_id,
      code,
      title,
      remarks,
      type,
      amount,
      rate,
      date,
      status,
    } = req.body;

    try {
      const invoiceGeneration = await prisma.invoiceGeneration.update({
        where: { id: BigInt(id) },
        data: {
          category_id,
          creator_id,
          code,
          title,
          remarks,
          type,
          amount,
          rate,
          date,
          status,
        },
      });

      return res.json({
        success: true,
        message: "Invoice generation updated",
        data: invoiceGeneration,
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
adminInvoiceGenerationRouter.delete(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    try {
      const invoiceGeneration = await prisma.invoiceGeneration.delete({
        where: { id: BigInt(id) },
      });

      return res.json({
        success: true,
        message: "Invoice generation deleted",
        data: invoiceGeneration,
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

export default adminInvoiceGenerationRouter;
