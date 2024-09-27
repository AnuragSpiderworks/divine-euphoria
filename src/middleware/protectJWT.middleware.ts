import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prismaExclude } from "../utils/prismaExclude";
import { ARequest } from "../routes/types";

const prisma = new PrismaClient();

export const protectJWT = async (req: ARequest, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, exclude password
      const user = await prisma.member.findUnique({
        where: { id: decoded.id },
        select: {
          ...prismaExclude("Member", ["password"]),
          LoginHistory: true,
          OwnedProperties: true,
          Invoices: true,
          InvoiceGenerations: true,
          Payments: {
            orderBy: {
              date: "desc",
            },
          },
          PaymentsVerified: true,
          _count: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      req.user = user;

      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
        data: null,
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
      data: null,
    });
  }
};
