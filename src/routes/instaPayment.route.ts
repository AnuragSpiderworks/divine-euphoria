import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import uniqid from 'uniqid';
const Insta = require('instamojo-nodejs');

const InstaPaymentRoute = Router();
const newClient = new PrismaClient();

Insta.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
Insta.isSandboxMode(true);

// Payment initiation route
InstaPaymentRoute.post('/pay', async (req, res) => {
  try {
    const { amount, userId, mobileNumber, name, email } = req.body;
    
    if (userId !== 2181 && userId !== 1) {
      return res.json({
        success: false,
        message: "This feature is currently disabled",
        data: null,
      });
    }

    const merchantTransactionId = uniqid(); // Generate unique transaction ID

    const data = new Insta.PaymentData();
    data.purpose = merchantTransactionId; // Payment purpose
    data.amount = amount.toFixed(2); // Format to 2 decimal places for Instamojo
    data.buyer_name = name;
    data.email = email;
    data.phone = mobileNumber;
    data.redirect_url = 'http://google.com';
    data.allow_repeated_payments = false;
    data.webhook = 'http://google.com'
    // data.payment_id = merchantTransactionId;

    // Create a new payment record in your database
    const newPayment = await newClient.payment.create({
      data: {
        member_id: userId,
        reference: merchantTransactionId,
        transaction_id: null,
        date: new Date(),
        amount,
        is_auto_payment: true,
        status: "INITIATED",
      },
    });

    // Record payment initiation in the history
    await newClient.paymentHistory.create({
      data: {
        payment_id: newPayment.id,
        status: "INITIATED",
        data: JSON.stringify(data),
      },
    });

    // Initiate payment through Instamojo
    Insta.createPayment(data, async(error, response) => {
      if (error) {
        console.log("Error occurred:", error);
        return res.status(500).json({
          success: false,
          message: "Payment initiation failed",
          error,
        });
      } else {
        const responseObject = JSON.parse(response);
        const instamojoTransactionId = responseObject?.payment_request?.id
        console.log(`Instamojo Response:${responseObject?.payment_request?.purpose}`,'----------'+instamojoTransactionId);
        const updatedTransaction = await newClient.payment.updateMany({
          where: {
            reference: responseObject?.payment_request?.purpose, 
          },
          data: {
            transaction_id: instamojoTransactionId, 
          },
        });
        return res.json({
          success: true,
          message: "payment created",
          data: responseObject,
        });

        // Update the payment record with the new transaction_id
       
        console.log(updatedTransaction)
      }
    });
  } catch (error) {
    console.log("Error in /pay route:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});




export default InstaPaymentRoute;
