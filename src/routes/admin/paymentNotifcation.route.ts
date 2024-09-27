import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import { ARequest } from "../../types";
import { Decimal } from "@prisma/client/runtime/library";
import transporter from "../../config/mailer";

const paymentNotificationRouter = Router();
const prisma = new PrismaClient();

paymentNotificationRouter.get("/all", protectJWT, isAdmin, async (req, res) => {
  try {
    const paymentNotifications = await prisma.paymentNotification.findMany({
      include: {
        TargetMember: true,
        PostedMember: true,
      },
    });

    return res.json({
      success: true,
      message: "Payment Notifications found",
      data: paymentNotifications,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Create Payment Notification
paymentNotificationRouter.post(
  "/new",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    try {
      const { target_member_id, custom_message } = req.body;

      const targetMember = await prisma.member.findUnique({
        where: {
          id: target_member_id,
        },
      });

      let paidAmount = new Decimal(0);
      let invoicedAmount = new Decimal(0);

      const payments = await prisma.payment.findMany({
        where: {
          member_id: target_member_id,
          status: { in: ["VERIFIED", "SUCCESS"] },
        },
      });

      const invoices = await prisma.invoice.findMany({
        where: {
          member_id: target_member_id,
        },
      });

      for (const payment of payments) {
        paidAmount = paidAmount.add(payment.amount);
      }

      for (const invoice of invoices) {
        invoicedAmount = invoicedAmount.add(invoice.amount);
      }

      const pendingAmount = invoicedAmount.sub(paidAmount);

      if (pendingAmount.toNumber() <= 0) {
        throw new Error("User has no pending amount");
      }

      const message_with_amount = `Pending Amount: ${pendingAmount.toNumber()} \n\n ${custom_message} `;

      // Send mail to target Member using targetMember.email
      const mailOptions = {
        from: process.env.MAILER_EMAIL,
        to: targetMember.email,
        subject: "Payment Notification",
        text: message_with_amount,
      };

      transporter.sendMail(mailOptions);

      const paymentNotification = await prisma.paymentNotification.create({
        data: {
          target_member_id,
          posted_member_id: req.user.id,
          amount: pendingAmount.toNumber(),
          custom_message,
        },
      });

      return res.json({
        success: true,
        message: "Payment Notification created",
        data: paymentNotification,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }
);

export default paymentNotificationRouter;
