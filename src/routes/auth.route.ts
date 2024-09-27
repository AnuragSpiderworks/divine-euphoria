import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcryptjs"; // replace argon2 with bcryptjs
import jwt from "jsonwebtoken";
import transporter from "../config/mailer";

const authRouter = Router();
const prisma = new PrismaClient();

authRouter.post("/register", async (req, res) => {
  let user;

  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      throw new Error("Please fill all fields");
    }

    if (name.length < 3) {
      throw new Error("Name must be at least 3 characters");
    }

    const existingUser = await prisma.member.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // if (!phone.match(/^\+?[1-9][0-9]{7,14}$/)) {
    //   throw new Error("Invalid phone number");
    // }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const hashedPassword = await bcrypt.hash(password, 10); // use bcryptjs to hash the password

    user = await prisma.member.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: email,
      subject: "Thank you for registering",
      html: `<h2>Welcome to the platform!</h2>`,
    };

    transporter.sendMail(mailOptions);
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  return res.json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

authRouter.post("/login", async (req, res) => {
  let user;
  try {
    const { email, password } = req.body;
    user = await prisma.member.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email");
    }

    if (!(await bcrypt.compare(password, user.password))) {
      // use bcryptjs to verify the password
      throw new Error("Invalid password");
    }

    const payload = {
      id: user.id,
      name: user.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // LoginHistory
    await prisma.loginHistory.create({
      data: {
        member_id: user.id,
        login_date: new Date(),
        login_ip_address: req.ip,
        success_status: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      data: token,
    });
  } catch (err: any) {
    // LoginHistory
    await prisma.loginHistory.create({
      data: {
        member_id: user?.id,
        login_date: new Date(),
        login_ip_address: req.ip,
        success_status: false,
      },
    });

    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.member.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email");
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET + user.password, {
      expiresIn: "15m",
    });

    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: email,
      subject: "Reset Password",
      html: `<h1>Click <a href="${req.headers.origin}/reset-password/${user.id}/${token}">here</a> to reset your password</h1>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Reset password link sent to your email",
      data: null,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const { id, token, password } = req.body;

    const user = await prisma.member.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      throw new Error("Invalid user");
    }

    jwt.verify(token, process.env.JWT_SECRET + user.password);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.member.update({
      where: { id: BigInt(id) },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default authRouter;
