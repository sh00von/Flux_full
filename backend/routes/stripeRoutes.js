const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);



router.post("/create-checkout-session", async (req, res) => {
    const { title, price } = req.body;
  
    if (!price || isNaN(price)) {
      return res.status(400).json({ error: "Invalid or missing price" });
    }
  
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'bdt',
              product_data: {
                name: title || 'Buy Now Product',
              },
              unit_amount: Math.round(price * 100), 
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
      });
  
      return res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Checkout session error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;