import { Router } from "express";
import { isAdmin } from "../../middleware/isAdmin.middleware";

import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { prismaExclude } from "../../utils/prismaExclude";

const reportRouter = Router();
const prisma = new PrismaClient();

reportRouter.get("/overdue", protectJWT, isAdmin, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      select: {
        ...prismaExclude("Member", ["password"]),
        Invoices: {
          include: {
            Property: true,
          },
        },
        Payments: true,
      },
    });

    const overdueMembers: Array<{
      id: BigInt;
      name: string;
      membership_number: BigInt;
      invoiceSum: number;
      paymentSum: number;
    }> = [];

    members.forEach((member) => {
      let { Invoices, Payments } = member;
      Payments = Payments.filter((payment) => payment.status === "VERIFIED");
      const invoiceSum = Invoices.reduce((acc, invoice) => {
        return (
          acc +
          (Number(invoice.amount) ||
            (invoice.Property?.area || 0) * Number(invoice.rate))
        );
      }, 0);
      const paymentSum = Payments.reduce((acc, curr) => {
        return acc + Number(curr.amount);
      }, 0);

      if (invoiceSum > paymentSum) {
        overdueMembers.push({
          id: member.id,
          name: member.name,
          membership_number: member.membership_number,
          invoiceSum,
          paymentSum,
        });
      }
    });

    return res.json({
      success: true,
      message: "Overdue members found",
      data: overdueMembers,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

reportRouter.get("/overpayment", protectJWT, isAdmin, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      select: {
        ...prismaExclude("Member", ["password"]),
        Invoices: {
          include: {
            Property: true,
          },
        },
        Payments: true,
      },
    });

    const overdueMembers: Array<{
      id: BigInt;
      name: string;
      membership_number: BigInt;
      invoiceSum: number;
      paymentSum: number;
    }> = [];

    members.forEach((member) => {
      let { Invoices, Payments } = member;
      Payments = Payments.filter((payment) => payment.status === "VERIFIED");
      const invoiceSum = Invoices.reduce((acc, invoice) => {
        return (
          acc +
          (Number(invoice.amount) ||
            (invoice.Property?.area || 0) * Number(invoice.rate))
        );
      }, 0);
      const paymentSum = Payments.reduce((acc, curr) => {
        return acc + Number(curr.amount);
      }, 0);

      if (invoiceSum < paymentSum) {
        overdueMembers.push({
          id: member.id,
          name: member.name,
          membership_number: member.membership_number,
          invoiceSum,
          paymentSum,
        });
      }
    });

    return res.json({
      success: true,
      message: "Overpaid members found",
      data: overdueMembers,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

reportRouter.get("/member", protectJWT, isAdmin, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      select: {
        ...prismaExclude("Member", ["password"]),
        Invoices: {
          include: {
            Property: true,
          },
        },
        Payments: true,
      },
    });

    const membersWithPaymentInfo: Array<{
      id: BigInt;
      name: string;
      membership_number: BigInt;
      invoiceSum: number;
      paymentSum: number;
      balance: number;
    }> = [];

    members.forEach((member) => {
      let { Invoices, Payments } = member;
      Payments = Payments.filter((payment) => payment.status === "VERIFIED");
      const invoiceSum = Invoices.reduce((acc, invoice) => {
        return (
          acc +
          (Number(invoice.amount) ||
            (invoice.Property?.area || 0) * Number(invoice.rate))
        );
      }, 0);
      const paymentSum = Payments.reduce((acc, curr) => {
        return acc + Number(curr.amount);
      }, 0);

      membersWithPaymentInfo.push({
        id: member.id,
        name: member.name,
        membership_number: member.membership_number,
        invoiceSum,
        paymentSum,
        balance: invoiceSum - paymentSum,
      });
    });

    return res.json({
      success: true,
      message: "Overpaid members found",
      data: membersWithPaymentInfo,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

reportRouter.post("/payment", protectJWT, isAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: new Date(start_date),
          lte: new Date(end_date),
        },
      },
      select: {
        ...prismaExclude("Payment", ["member_id"]),
        Member: {
          select: {
            ...prismaExclude("Member", ["password"]),
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Payments found",
      data: payments,
    });
  } catch (err: any) {
    res.json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default reportRouter;
