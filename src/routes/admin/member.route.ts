import { PrismaClient } from "@prisma/client";

import { Router } from "express";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { ARequest, MemberNoPassword, UpdateMemberDTO } from "../../types";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import { prismaExclude } from "../../utils/prismaExclude";
import bcrypt from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";

const adminMemberRouter = Router();

const prisma = new PrismaClient();

adminMemberRouter.get(
  "/all",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    let users: Array<MemberNoPassword> = [];

    try {
      users = await prisma.member.findMany({
        select: {
          ...prismaExclude("Member", ["password"]),
          LoginHistory: true,
          OwnedProperties: true,
          Invoices: true,
          InvoiceGenerations: true,
          Payments: true,
          PaymentsVerified: true,
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
      message: "All users found",
      data: users,
    });
  }
);

// adminMemberRouter.get(
//   "/admins",
//   protectJWT,
//   isAdmin,
//   async (req: ARequest, res) => {
//     let admins: Array<MemberNoPassword> = [];

//     try {
//       admins = await prisma.member.findMany({
//         where: { role: "ADMIN" }, // Filter users based on isAdmin field
//         select: {
//           ...prismaExclude("Member", ["password"]),
//           LoginHistory: true,
//           OwnedProperties: true,
//           Invoices: true,
//           InvoiceGenerations: true,
//           Payments: true,
//           PaymentsVerified: true,
//           _count: true,
//         },
//       });
//     } catch (err: any) {
//       return res.status(400).json({
//         success: false,
//         message: err.message,
//         data: null,
//       });
//     }

//     return res.json({
//       success: true,
//       message: "All admins found",
//       data: admins,
//     });
//   }
// );

adminMemberRouter.get(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    let user: MemberNoPassword;

    try {
      user = await prisma.member.findUnique({
        where: { id: BigInt(id) },
        select: {
          ...prismaExclude("Member", ["password"]),
          LoginHistory: {
            take: 50,
            orderBy: {
              login_date: "desc",
            },
          },
          OwnedProperties: {
            include: {
              Property: true,
            },
          },
          Invoices: {
            include: {
              Category: true,
              Property: true,
            },
          },
          InvoiceGenerations: true,
          Payments: {
            include: {
              Member: true,
              Verifier: true,
            },
          },
          PaymentsVerified: true,
          Notes: {
            include: {
              PostedMember: true,
            },
          },
          PaymentNotifications: {
            include: {
              PostedMember: true,
            },
          },
          AuditLogsTargeted: {
            include: {
              PerformedMember: true,
              TargetMember: true,
              Property: true,
            },
            orderBy: {
              timestamp: "desc",
            },
          },
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    return res.json({
      success: true,
      message: "User found",
      data: user,
    });
  }
);

adminMemberRouter.put(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;
    const updateData: UpdateMemberDTO = req.body;

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    let user: MemberNoPassword;

    try {
      user = await prisma.member.update({
        where: { id: BigInt(id) },
        data: updateData,
        select: {
          ...prismaExclude("Member", ["password"]),
          LoginHistory: true,
          OwnedProperties: true,
          Invoices: true,
          InvoiceGenerations: true,
          Payments: true,
          PaymentsVerified: true,
          Notes: true,
          NotesPosted: true,
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
      message: "User updated",
      data: user,
    });
  }
);

adminMemberRouter.put(
  "/generateMembershipNumber/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    try {
      // Get the last membership number
      const lastMember = await prisma.member.findFirst({
        where: {
          NOT: {
            membership_number: null,
          },
        },
        orderBy: {
          membership_number: "desc",
        },
      });

      const member = await prisma.member.update({
        where: { id: BigInt(id) },
        data: {
          membership_number: BigInt(
            Number(lastMember?.membership_number || null) + 1
          ),
        },
      });

      return res.json({
        success: true,
        message: "Membership number generated",
        data: member,
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

adminMemberRouter.get(
  "/:id/invoicedAmount",
  protectJWT,
  async (req: ARequest, res) => {
    try {
      const userId = BigInt(req.params.id);

      let invoicedAmount = new Decimal(0);

      const invoices = await prisma.invoice.findMany({
        where: {
          member_id: userId,
        },
        include: {
          Property: true,
        },
      });

      for (const invoice of invoices) {
        invoicedAmount = invoicedAmount.add(
          invoice.amount || (invoice.Property?.area || 0) * Number(invoice.rate)
        );
      }

      res.json({
        success: true,
        message: "Invoiced amount found",
        data: invoicedAmount.toNumber(),
      });
    } catch (err: any) {
      return res.json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }
);

adminMemberRouter.get(
  "/:id/paidAmount",
  protectJWT,
  async (req: ARequest, res) => {
    try {
      const userId = BigInt(req.params.id);
      let paidAmount = new Decimal(0);

      const payments = await prisma.payment.findMany({
        where: {
          member_id: userId,
          status: { in: ["VERIFIED", "SUCCESS"] },
        },
      });

      for (const payment of payments) {
        paidAmount = paidAmount.add(payment.amount);
      }

      res.json({
        success: true,
        message: "Paid amount found",
        data: paidAmount.toNumber(),
      });
    } catch (err: any) {
      return res.json({
        success: false,
        message: err.message,
        data: null,
      });
    }
  }
);

adminMemberRouter.delete(
  "/:id",
  protectJWT,
  isAdmin,
  async (req: ARequest, res) => {
    const { id } = req.params;

    try {
      // Change user status to INACTIVE
      await prisma.member.update({
        where: { id: BigInt(id) },
        data: {
          role: "INACTIVE",
        },
      });

      return res.json({
        success: true,
        message: "User deleted",
        data: null,
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

// purge delete route (completely erase them)
// adminMemberRouter.delete(
//   "/:id/purge",
//   protectJWT,
//   isAdmin,
//   async (req: ARequest, res) => {
//     const { id } = req.params;

//     try {
//       // Get all InvoiceGenerations for the member
//       const invoiceGenerations = await prisma.invoiceGeneration.findMany({
//         where: { creator_id: Number(id) },
//       });

//       // Delete all Invoices associated with each InvoiceGeneration
//       for (const invoiceGeneration of invoiceGenerations) {
//         await prisma.invoice.deleteMany({
//           where: { category_id: invoiceGeneration.category_id },
//         });
//       }

//       // Get all WorkReports for the member
//       const workReports = await prisma.workReport.findMany({
//         where: { posted_user_id: Number(id) },
//       });

//       // Delete all WorkReportPhotos associated with each WorkReport
//       for (const workReport of workReports) {
//         await prisma.workReportPhoto.deleteMany({
//           where: { work_report_id: workReport.id },
//         });
//       }

//       // Get all OwnedProperties for the member
//       const ownedProperties = await prisma.ownedProperty.findMany({
//         where: { member_id: Number(id) },
//       });

//       // Delete all ForSalePosts associated with each OwnedProperty
//       for (const ownedProperty of ownedProperties) {
//         await prisma.forSalePost.deleteMany({
//           where: { owned_property_id: ownedProperty.id },
//         });
//       }

//       // Now delete the member and associated data as before
//       await prisma.$transaction([
//         prisma.loginHistory.deleteMany({ where: { member_id: Number(id) } }),
//         prisma.ownedProperty.deleteMany({ where: { member_id: Number(id) } }),
//         prisma.invoiceGeneration.deleteMany({
//           where: { creator_id: Number(id) },
//         }),
//         prisma.payment.deleteMany({ where: { member_id: Number(id) } }),
//         prisma.document.deleteMany({ where: { posted_user_id: Number(id) } }),
//         prisma.contact.deleteMany({ where: { posted_user_id: Number(id) } }),
//         prisma.workReport.deleteMany({ where: { posted_user_id: Number(id) } }),
//         prisma.galleryPhoto.deleteMany({
//           where: { posted_user_id: Number(id) },
//         }),
//         prisma.note.deleteMany({ where: { target_member_id: Number(id) } }),
//         prisma.note.deleteMany({ where: { posted_member_id: Number(id) } }),
//         prisma.paymentNotification.deleteMany({
//           where: { target_member_id: Number(id) },
//         }),
//         prisma.paymentNotification.deleteMany({
//           where: { posted_member_id: Number(id) },
//         }),
//         prisma.member.delete({ where: { id: Number(id) } }),
//         prisma.auditLog.deleteMany({
//           where: { performed_member_id: Number(id) },
//         }),
//         prisma.auditLog.deleteMany({ where: { target_member_id: Number(id) } }),
//       ]);

//       return res.json({
//         success: true,
//         message: "User deleted",
//         data: null,
//       });
//     } catch (err: any) {
//       return res.status(400).json({
//         success: false,
//         message: err.message,
//         data: null,
//       });
//     }
//   }
// );

export default adminMemberRouter;
