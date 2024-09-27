import { PrismaClient } from "@prisma/client";

import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { ARequest } from "../../types";
import { isAdmin } from "../../middleware/isAdmin.middleware";

const paymentRouter = Router();

const prisma = new PrismaClient();

// Get all payments
paymentRouter.get("/all", protectJWT, isAdmin, async (_: ARequest, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        Member: true,
        Verifier: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return res.json({
      success: true,
      message: "Payments found",
      data: payments,
    });
  } catch (err: any) {
    return res
      .status(400)
      .json({ success: false, message: err.message, data: null });
  }
});

// Create a payment
paymentRouter.post("/", protectJWT, isAdmin, async (req: ARequest, res) => {
  const {
    member_email,
    date,
    amount,
    mode,
    reference,
    remarks,
    is_auto_payment,
  } = req.body;
  try {
    const member = await prisma.member.findFirst({
      where: {
        email: member_email,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        member_id: member.id,
        date,
        amount,
        mode,
        reference,
        remarks,
        is_auto_payment,
        status: "INITIATED",
      },
    });

    // Create payment history log
    await prisma.paymentHistory.create({
      data: {
        payment_id: payment.id,
        status: "INITIATED",
        data: JSON.stringify(payment),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        table: "PAYMENT",
        performed_member_id: req.user.id,
        target_member_id: member.id,
        old_value: null,
        new_value: JSON.stringify(payment),
      },
    });

    return res.json({
      success: true,
      message: "Payment created",
      data: payment,
    });
  } catch (err: any) {
    return res
      .status(400)
      .json({ success: false, message: err.message, data: null });
  }
});

// Get a payment by id
paymentRouter.get("/:id", protectJWT, isAdmin, async (req: ARequest, res) => {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found", data: null });
    }
    return res.json({ success: true, message: "Payment found", data: payment });
  } catch (err: any) {
    return res
      .status(400)
      .json({ success: false, message: err.message, data: null });
  }
});

// Update a payment
paymentRouter.put("/:id", protectJWT, isAdmin, async (req: ARequest, res) => {
  const { id } = req.params;
  const { date, amount, mode, reference, remarks, is_auto_payment } = req.body;
  try {
    const oldPayment = await prisma.payment.findUnique({
      where: { id: BigInt(id) },
    });

    const payment = await prisma.payment.update({
      where: { id: BigInt(id) },
      data: {
        date,
        amount,
        mode,
        reference,
        remarks,
        is_auto_payment,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        table: "PAYMENT",
        performed_member_id: req.user.id,
        target_member_id: payment.member_id,
        old_value: JSON.stringify(oldPayment),
        new_value: JSON.stringify(payment),
      },
    });

    return res.json({
      success: true,
      message: "Payment updated",
      data: payment,
    });
  } catch (err: any) {
    return res
      .status(400)
      .json({ success: false, message: err.message, data: null });
  }
});

paymentRouter.put(
  "/verify/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    const status = "VERIFIED";
    const verifier_email = req.user.email;
    const verified_date = new Date();
    try {
      const verifier = await prisma.member.findFirst({
        where: { email: verifier_email },
      });

      const oldPayment = await prisma.payment.findUnique({
        where: { id: BigInt(id) },
      });

      const payment = await prisma.payment.update({
        where: { id: BigInt(id) },
        data: {
          status,
          verifier_id: verifier.id,
          verified_date,
        },
      });

      // Create payment history log
      await prisma.paymentHistory.create({
        data: {
          payment_id: payment.id,
          status,
          data: JSON.stringify(payment),
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: "VERIFY",
          table: "PAYMENT",
          performed_member_id: req.user.id,
          target_member_id: payment.member_id,
          old_value: JSON.stringify(oldPayment),
          new_value: JSON.stringify(payment),
        },
      });

      return res.json({
        success: true,
        message: "Payment verified",
        data: payment,
      });
    } catch (err: any) {
      return res
        .status(400)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

// Delete a payment
paymentRouter.delete(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    try {
      const payment = await prisma.payment.delete({
        where: { id: BigInt(id) },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          table: "PAYMENT",
          performed_member_id: req.user.id,
          target_member_id: payment.member_id,
          old_value: JSON.stringify(payment),
          new_value: null,
        },
      });

      return res.json({
        success: true,
        message: "Payment deleted",
        data: payment,
      });
    } catch (err: any) {
      return res
        .status(400)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

export default paymentRouter;
