import axios from "axios";
import sha256 from "sha256";
import uniqid from "uniqid";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const paymentRouter = Router();
const prisma = new PrismaClient();

paymentRouter.post("/new", async (req, res) => {
  // Initiate a payment

  // Transaction amount
  const amount = +req.body.amount;
  // User ID is the ID of the user present in our application DB
  const userId = req.body.userId;
  const mobileNumber = req.body.mobileNumber;

  if (userId != 2181 && userId != 1) {
    res.json({
      success: false,
      message: "This feature is currently disabled",
      data: null,
    });
    return;
  }

  // Generate a unique merchant transaction ID for each transaction
  let merchantTransactionId = uniqid();

  let normalPayLoad = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: amount * 100, // converting to paise
    // Give frontend url
    redirectUrl: `${req.headers.referer}/dashboard/makePayment?transactionId=${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    // CHANGE
    mobileNumber,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const newPayment = await prisma.payment.create({
    data: {
      member_id: userId,
      reference: merchantTransactionId,
      transaction_id: merchantTransactionId,
      date: new Date(),
      amount,
      mode: "OTHER",
      is_auto_payment: true,
      status: "INITIATED",
    },
  });

  await prisma.paymentHistory.create({
    data: {
      payment_id: newPayment.id,
      status: "INITIATED",
      data: JSON.stringify(normalPayLoad),
    },
  });

  // Make a base64-encoded payload
  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
  let base64EncodedPayload = bufferObj.toString("base64");

  // X-VERIFY => SHA256(base64EncodedPayload + "/pg/v1/pay" + SALT_KEY) + ### + SALT_INDEX
  let string =
    base64EncodedPayload + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY;
  let sha256_val = sha256(string);
  let xVerifyChecksum = sha256_val + "###" + process.env.PHONEPE_SALT_INDEX;

  axios
    .post(
      `${process.env.PHONEPE_HOST_URL}/pg/v1/pay`,
      { request: base64EncodedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyChecksum,
          accept: "application/json",
        },
      }
    )
    .then(function (response) {
      res.json({
        success: true,
        message: "Payment initiated",
        data: response.data.data.instrumentResponse.redirectInfo.url,
      });
    })
    .catch(function (error) {
      res.json({
        success: false,
        message: "Payment initiation failed",
        data: error.response.data,
      });
    });
});

paymentRouter.get(
  "/validate/:merchantTransactionId",
  async function (req, res) {
    const { merchantTransactionId } = req.params;

    if (merchantTransactionId) {
      const payment = await prisma.payment.findFirst({
        where: {
          transaction_id: merchantTransactionId,
        },
      });

      if (!payment) {
        res.json({
          success: false,
          message: "Invalid merchant transaction ID",
          data: null,
        });
        return;
      }

      if (payment.status != "INITIATED") {
        res.json({
          success: true,
          message: "Payment already processed",
          data: null,
        });
        return;
      }

      let statusUrl =
        `${process.env.PHONEPE_HOST_URL}/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/` +
        merchantTransactionId;

      let string =
        `/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/` +
        merchantTransactionId +
        process.env.PHONEPE_SALT_KEY;
      let sha256_val = sha256(string);
      let xVerifyChecksum = sha256_val + "###" + process.env.PHONEPE_SALT_INDEX;

      axios
        .get(statusUrl, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            "X-MERCHANT-ID": merchantTransactionId,
            accept: "application/json",
          },
        })
        .then(async function (response) {
          console.log("response->", response.data);
          if (response.data && response.data.code === "PAYMENT_SUCCESS") {
            await prisma.payment.updateMany({
              where: {
                transaction_id: { equals: merchantTransactionId, not: null },
              },
              data: {
                mode: response.data.data.paymentInstrument.type,
                status: "SUCCESS",
              },
            });

            await prisma.paymentHistory.create({
              data: {
                payment_id: payment.id,
                status: "SUCCESS",
                data: JSON.stringify(response.data),
              },
            });

            res.json({
              success: true,
              message: "Payment successful",
              data: response.data,
            });
          } else if (
            response.data &&
            response.data.code === "PAYMENT_PENDING"
          ) {
            await prisma.payment.updateMany({
              where: {
                transaction_id: { equals: merchantTransactionId, not: null },
              },
              data: {
                mode: response.data.data.paymentInstrument.type,
                status: "INITIATED",
              },
            });

            await prisma.paymentHistory.create({
              data: {
                payment_id: payment.id,
                status: "INITIATED",
                data: JSON.stringify(response.data),
              },
            });

            res.json({
              success: true,
              message: "Payment pending",
              data: response.data,
            });
          } else {
            await prisma.payment.updateMany({
              where: {
                transaction_id: { equals: merchantTransactionId, not: null },
              },
              data: {
                mode: response.data.data.paymentInstrument.type,
                status: "FAILED",
              },
            });

            await prisma.paymentHistory.create({
              data: {
                payment_id: payment.id,
                status: "FAILED",
                data: JSON.stringify(response.data),
              },
            });

            res.json({
              success: false,
              message: "Payment failed",
              data: response.data,
            });
          }
        })
        .catch(async function (error) {
          await prisma.payment.updateMany({
            where: {
              transaction_id: { equals: merchantTransactionId, not: null },
            },
            data: {
              status: "FAILED",
            },
          });
          res.json({
            success: false,
            message: "Payment validation failed",
            data: error,
          });
        });
    } else {
      res.json({
        success: false,
        message: "Invalid merchant transaction ID",
        data: null,
      });
    }
  }
);

export default paymentRouter;
