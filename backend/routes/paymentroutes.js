import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 1. Create Order Route
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body; 
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
        };

        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send("Error creating order");
        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Verify Payment Route (✨ Yeh missing tha!)
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Signature verify karne ke liye string banana
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        
        // HMAC SHA256 se expected signature generate karna
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully", success: true });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!", success: false });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

export default router;