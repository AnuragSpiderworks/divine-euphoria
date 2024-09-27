import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { protectJWT } from "../../middleware/protectJWT.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";

const contactRouter = Router();
const prisma = new PrismaClient();

// Create Contact
contactRouter.post("/", protectJWT, isAdmin, async (req, res) => {
  try {
    const { name, designation, email, phone, display_sequence } = req.body;

    const createdContact = await prisma.contact.create({
      data: {
        name,
        designation,
        email,
        phone,
        display_sequence,
        posted_user_id: BigInt(req.user.id),
        posted_date: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "Contact created",
      data: createdContact,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Read Contact
contactRouter.get("/all", protectJWT, isAdmin, async (req, res) => {
  try {
    const contact = await prisma.contact.findMany({
      orderBy: {
        display_sequence: "asc",
      },
    });

    return res.json({
      success: true,
      message: "Contact fetched",
      data: contact,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Read Contact
contactRouter.get("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({
      where: { id: BigInt(id) },
    });

    return res.json({
      success: true,
      data: contact,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Update Contact
contactRouter.put("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const contactData = req.body;

    const updatedContact = await prisma.contact.update({
      where: { id: BigInt(id) },
      data: contactData,
    });

    return res.json({
      success: true,
      message: "Contact updated",
      data: updatedContact,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

// Delete Contact
contactRouter.delete("/:id", protectJWT, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContact = await prisma.contact.delete({
      where: { id: BigInt(id) },
    });

    return res.json({
      success: true,
      message: "Contact deleted",
      data: deletedContact,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});

export default contactRouter;
