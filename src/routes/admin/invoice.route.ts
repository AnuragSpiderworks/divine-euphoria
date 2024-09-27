import { Router } from "express";
import { isAdmin } from "../../middleware/isAdmin.middleware";

import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../../middleware/protectJWT.middleware";

const invoiceRouter = Router();
const prisma = new PrismaClient();

invoiceRouter.post("/", protectJWT, isAdmin, async (req, res) => {
  try {
    const {
      member_id,
      invoice_category_name,
      creator_id,

      title,
      remarks,
      amount,
      date,
    } = req.body;

    const category = await prisma.invoiceCategory.findFirst({
      where: { name: invoice_category_name },
    });

    const category_id = category?.id;

    const invoice = await prisma.invoice.create({
      data: {
        member_id,
        category_id,
        creator_id,
        title,
        remarks,
        amount,
        date,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        table: "INVOICE",
        performed_member_id: req.user.id,
        target_member_id: invoice.member_id,
        old_value: null,
        new_value: JSON.stringify(invoice),
      },
    });

    return res.json({
      success: true,
      message: "Invoice created",
      data: invoice,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

invoiceRouter.put("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      member_id,
      invoice_category_name,
      creator_id,

      title,
      remarks,
      amount,
      date,
    } = req.body;

    const category = await prisma.invoiceCategory.findFirst({
      where: { name: invoice_category_name },
    });

    const category_id = category?.id;

    const oldInvoice = await prisma.invoice.findFirst({
      where: { id },
    });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        member_id,
        category_id,
        creator_id,
        title,
        remarks,
        amount,
        date,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        table: "INVOICE",
        performed_member_id: req.user.id,
        target_member_id: invoice.member_id,
        old_value: JSON.stringify(oldInvoice),
        new_value: JSON.stringify(invoice),
      },
    });

    return res.json({
      success: true,
      message: "Invoice updated",
      data: invoice,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Delete
invoiceRouter.delete("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        table: "INVOICE",
        performed_member_id: req.user.id,
        target_member_id: invoice.member_id,
        old_value: JSON.stringify(invoice),
        new_value: null,
      },
    });

    return res.json({
      success: true,
      message: "Invoice deleted",
      data: invoice,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default invoiceRouter;
