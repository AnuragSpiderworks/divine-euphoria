import { Router } from "express";
import adminMemberRouter from "./admin/member.route";
import adminPropertyRouter from "./admin/property.route";
import adminInvoiceCategoryRouter from "./admin/invoiceCategory.route";
import adminInvoiceGenerationRouter from "./admin/invoiceGeneration.route";
import paymentRouter from "./admin/payment.route";
import reportRouter from "./admin/report.route.ts";
import invoiceRouter from "./admin/invoice.route";
import documentRouter from "./admin/document.route";
import contactRouter from "./admin/contact.route";
import adminOwnedPropertyRouter from "./admin/ownedProperty.route";
import workReportRouter from "./admin/workReport.route";
import adminNotesRouter from "./admin/note.route";
import galleryPhotoAdminRouter from "./admin/galleryPhoto.route";
import forSalePostAdminRouter from "./admin/forSalePost.route";
import adminTagsRouter from "./admin/tag.route";
import paymentNotificationRouter from "./admin/paymentNotifcation.route";

const adminRouter = Router();

adminRouter.use("/member", adminMemberRouter);
adminRouter.use("/property", adminPropertyRouter);
adminRouter.use("/invoiceCategory", adminInvoiceCategoryRouter);
adminRouter.use("/invoiceGeneration", adminInvoiceGenerationRouter);
adminRouter.use("/payment", paymentRouter);
adminRouter.use("/report", reportRouter);
adminRouter.use("/invoice", invoiceRouter);
adminRouter.use("/document", documentRouter);
adminRouter.use("/contact", contactRouter);
adminRouter.use("/ownedProperty", adminOwnedPropertyRouter);
adminRouter.use("/workReport", workReportRouter);
adminRouter.use("/note", adminNotesRouter);
adminRouter.use("/galleryPhoto", galleryPhotoAdminRouter);
adminRouter.use("/forSalePost", forSalePostAdminRouter);
adminRouter.use("/tag", adminTagsRouter);
adminRouter.use("/paymentNotification", paymentNotificationRouter);

export default adminRouter;
