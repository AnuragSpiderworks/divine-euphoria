import express from "express";
import authRouter from "./routes/auth.route";
import memberRouter from "./routes/member.route";
import adminRouter from "./routes/admin.route";
import documentRouter from "./routes/document.route";
import contactRouter from "./routes/contact.route";
import workReportRouter from "./routes/workReport.route";
import galleryPhotoRouter from "./routes/galleryPhoto.route";
import forSalePostRouter from "./routes/forSalePost.route";
import tagsRouter from "./routes/tag.route";
import propertyRouter from "./routes/property.route";
import ownedPropertyRouter from "./routes/ownedProperty.route";
import paymentRouter from "./routes/payment.route";
import paymentRoute from "./routes/instamojoPayment"
import InstaPaymentRoute from "./routes/instaPayment.route";
import WeebHookRoute from "./routes/instaMojoWebhook";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/member", memberRouter);
router.use("/admin", adminRouter);
router.use("/property", propertyRouter);
router.use("/ownedProperty", ownedPropertyRouter);
router.use("/payment", paymentRouter);
router.use("/document", documentRouter);
router.use("/contact", contactRouter);
router.use("/workReport", workReportRouter);
router.use("/galleryPhoto", galleryPhotoRouter);
router.use("/forSalePost", forSalePostRouter);
router.use("/tag", tagsRouter);
router.use('/instamojoPayment', paymentRoute)
router.use('/insta-Payment', InstaPaymentRoute)
router.use('/webhook', WeebHookRoute)

export default router;
