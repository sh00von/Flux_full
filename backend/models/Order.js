// models/Order.js
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      listingId: { type: String, required: true },
      title:     { type: String, required: true },
      price:     { type: Number, required: true },
      quantity:  { type: Number, required: true },
    }
  ],
  deliveryType: {
    type: String,
    enum: ['local', 'shipping'],
    required: true
  },
  subtotal:     { type: Number, required: true },
  deliveryFee:  { type: Number, required: true },
  totalAmount:  { type: Number, required: true },
  paymentMethod:{
    type: String,
    enum: ['points', 'card'],
    required: true
  },
  createdAt:    { type: Date, default: Date.now }
})

module.exports = mongoose.model('Order', orderSchema)
