import { ARequest } from "../types";

export const isAdmin = async (req: ARequest, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(401).json({
      success: false,
      message: "Not authorized, only ADMIN can access this route",
      data: null,
    });
  }

  next();
};
