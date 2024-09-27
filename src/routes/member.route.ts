import multer from "multer";
import path from "path";
import { Router } from "express";
import { protectJWT } from "../middleware/protectJWT.middleware";
import {
  AFRequest,
  ARequest,
  MemberNoPassword,
  UpdateMemberDTO,
} from "../types";
import { prismaExclude } from "../utils/prismaExclude";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";

const memberRouter = Router();
const prisma = new PrismaClient();
const profilePictureStorage = multer.diskStorage({
  destination: "public/images/profile_pictures",
  filename: function (req, file, cb) {
    cb(
      null,
      req.user.name.replace(/ /g, "_") +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Please upload an image file"), false);
    }
    cb(null, true);
  },
}).single("profile_picture");

memberRouter.get("/me", protectJWT, async (req: ARequest, res) => {
  return res.json({
    success: true,
    message: "User found",
    data: req.user,
  });
});

memberRouter.put(
  "/me",
  protectJWT,
  uploadProfilePicture,
  async (req: AFRequest, res, next) => {
    const { id } = req.user;
    const updateData: UpdateMemberDTO = req.body;

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.file) {
      updateData.profile_picture_url = `/images/profile_pictures/${req.file.filename}`;
    }

    // @ts-ignore
    delete updateData.profile_picture;

    let user: any;

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
          Documents: true,
          Contacts: true,
          WorkReports: true,
          AuditLogsPerformed: true,
          AuditLogsTargeted: true,
          Notes: true,
          GalleryPhotos: true,
          PostedTags: true,
          PaymentNotifications: true,
          PaymentNotificationsPosted: true,
          _count: true,
        },
      });
    } catch (err: any) {
      return next(err);
    }

    return res.json({
      success: true,
      message: "User updated",
      data: user,
    });
  },
  (error, req, res, next) => {
    // This is the error-handling middleware function.
    // If there's an error, Multer will skip the normal middleware functions and call this function.
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    next();
  }
);

memberRouter.get("/all", protectJWT, async (req: ARequest, res) => {
  let users: any[];

  try {
    users = await prisma.member.findMany({
      select: {
        ...prismaExclude("Member", ["password"]),
        OwnedProperties: true,
        _count: true,
      },
      where: {
        role: {
          not: "INACTIVE",
        },
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
    message: "Users found",
    data: users,
  });
});

memberRouter.get("/invoicedAmount", protectJWT, async (req: ARequest, res) => {
  try {
    const userId = req.user.id;
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
});

memberRouter.get("/paidAmount", protectJWT, async (req: ARequest, res) => {
  try {
    const userId = req.user.id;
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
});

memberRouter.get("/:id", protectJWT, async (req: ARequest, res) => {
  const { id } = req.params;

  let user: MemberNoPassword;

  try {
    user = await prisma.member.findUnique({
      where: { id: BigInt(id) },
      select: {
        ...prismaExclude("Member", ["password"]),
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
        Payments: {
          include: {
            Member: true,
            Verifier: true,
          },
        },
        Notes: {
          include: {
            PostedMember: true,
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
});

export default memberRouter;
