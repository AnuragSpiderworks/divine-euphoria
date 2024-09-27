import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import uniqid from "uniqid";

const paymentRoute = Router();
const newClient = new PrismaClient();

paymentRoute.post("/new",async(req, res) => {
  console.log("dkajkdajkj")
  const amount = +req.body.amount;
  const userId = req.body.userId;
  const mobileNumber = req.body.mobileNumber;
  const email = req.body.email;
  const name = req.body.name;
console.log(req?.body)
  if (userId != 2181 && userId != 1) {
    res.json({
      success: false,
      message: "This feature is currently disabled",
      data: null,
    });
    // console.log('object')
    return;
  }

  //   creatring an unique transactionId

  let merchantTransactionId = uniqid();

  let instamojoData = {
    amount: amount * 100,
    email: email,
    phone: mobileNumber,
    buyer_name: name,
    redirect_url: process.env.INSTAMOJO_REDIRECT_URL,
    webhook: process.env.INSTAMOJO_WEBHOOK_URL
  };
  // creating payment
try {
 
  console.log(process.env.INSTAMOJO_API_KEY);
  const newPayment =  newClient.payment.create({
    data:{
      member_id: userId,
      reference: merchantTransactionId,
      transaction_id: merchantTransactionId,
      date: new Date(),
      amount,
      mode: "OTHER",
      is_auto_payment: true,
      status: "INITIATED",
    }
  })
  // calling api of instamojo
  const response = await axios.post('https://api.instamojo.com/v2/payment_requests/', instamojoData,{
    headers:{
      Authorization: 'Bearer 7FjaREMQHfpXkq8m-Qf37OJb0qN_vLf1bFsq1t1BQ78.u_E3EbYoCEHujIn-tbg3q2Xyz6sk98Yj0nOvyfMM-ys',
      "X-Api-Key": process.env.INSTAMOJO_API_KEY,
      "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
      "Content-Type": "application/json",
      
    }
    
  })
  console.log("hfgghgh", newPayment)
  console.log("this is the response", response)
  if(response.data && response.data.success){
    
  }
  
} catch (error) {
  res.json({
    success: false,
    message: "Error initiating payment",
    data: error,
  })

}
});

export default paymentRoute
