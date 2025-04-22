// controllers/orderController.js
const Order = require('../models/Order')
const User  = require('../models/User')

// POST /api/users/pay-with-points
// Body: { amount, items, deliveryType, subtotal, deliveryFee }
exports.payWithPoints = async (req, res) => {
  try {
    const userId = req.user.userId
    const {
      amount,
      items,
      deliveryType,
      subtotal,
      deliveryFee,
    } = req.body

    // 1) Load user
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // 2) Check points
    if (user.referralReward < amount) {
      return res.status(400).json({ message: 'Not enough points' })
    }

    // 3) Deduct points
    user.referralReward -= amount
    await user.save()

    // 4) Create order
    const order = await Order.create({
      user:          user._id,
      items,
      deliveryType,
      subtotal,
      deliveryFee,
      totalAmount:   amount,
      paymentMethod: 'points',
    })

    return res.status(201).json(order)
  } catch (error) {
    console.error('payWithPoints error:', error)
    return res.status(500).json({ message: error.message })
  }
}
