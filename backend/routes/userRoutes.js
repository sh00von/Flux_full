// routes/userRoutes.js
const express = require('express')
const router = express.Router()

// User‐centric controllers
const {
  registerUser,
  signInUser,
  getProfile,
  generateReferralCode,
  makeAdmin,
} = require('../controllers/userController')

// Order‐centric controller for point checkout
const { payWithPoints } = require('../controllers/orderController')

const verifyToken = require('../middleware/auth')

// User routes
router.post('/register', registerUser)
router.post('/signin', signInUser)
router.get('/profile', verifyToken, getProfile)
router.post('/generate-referral-code', verifyToken, generateReferralCode)
router.put('/:id/make-admin', makeAdmin)

// Point‐payment route
router.post('/pay-with-points', verifyToken, payWithPoints)

module.exports = router
