import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const WeebHookRoute = Router()
const newClient = new PrismaClient()

WeebHookRoute.post('/payment', async(req, res) => {
    try {
        console.log("body", req.body)
        const { payment_id , status } = req.body 
// checking the status 
        const paymentStatus = status === 'Credit' ? 'SUCCESS' : 'FAILED'
        // updating the payment in payment table
        const updatedPayment = await newClient.payment.updateMany({
            where: {
                transaction_id: payment_id
            },
            data: {
                status: paymentStatus
            }
        })
        console.log("updated payment", updatedPayment)
        res.status(200).json({
            sucess: true,
            message: 'payment updated, webhook sucessfull',
            data: updatedPayment
        })
    } catch (error) {
       console.log("catch block error", error) 
       res.status(200).json({
        sucess: false,
        message: 'payment updation failed',
        data: error
    })
    }
})

export default WeebHookRoute