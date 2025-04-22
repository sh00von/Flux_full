// controllers/userController.js

const User = require('../models/User')
const Referral = require('../models/Referral')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Master list of allowed categories
const categories = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Vehicles",
  "Collectibles",
  "Books",
  "Jewelry",
  "Other",
]

// Helper: generate a random 6‑char alphanumeric uppercase code
const generateRandomReferralCode = () =>
  Math.random().toString(36).substr(2, 6).toUpperCase()

// Helper: validate a single category
const sanitizeCategory = (c) =>
  typeof c === 'string' && categories.includes(c) ? c : null

// Register a new user with referral & single interestedCategory
const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      profilePicture,
      referralCode: inputReferralCode,
      interestedCategory: rawCategory,
    } = req.body

    // Ensure required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' })
    }

    // Validate category
    const interestedCategory = sanitizeCategory(rawCategory)
    if (!interestedCategory) {
      return res.status(400).json({ message: 'Please select a valid category' })
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate referral code
    const generatedReferralCode = generateRandomReferralCode()

    // Create user with 1000 initial points
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture: profilePicture || '',
      referralCode: generatedReferralCode,
      referralReward: 1000,       // ← initial points
      interestedCategory,
    })

    const savedUser = await newUser.save()

    // Process referral if provided
    if (inputReferralCode && inputReferralCode.trim() !== '') {
      const referrer = await User.findOne({ referralCode: inputReferralCode })
      if (referrer && referrer._id.toString() !== savedUser._id.toString()) {
        await Referral.create({
          referrer: referrer._id,
          referee: savedUser._id,
        })
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { referralReward: 10 },
        })
      }
    }

    // Respond with user + categories
    res.status(201).json({
      user: savedUser,
      categories,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Sign in user and return JWT + profile + categories
const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const payload = {
      userId: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        referralCode: user.referralCode,
        referralReward: user.referralReward,
        interestedCategory: user.interestedCategory,
      },
      categories,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get user profile (protected) + categories
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({
      user,
      categories,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Generate or regenerate a referral code for the authenticated user
const generateReferralCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const newCode = generateRandomReferralCode()
    user.referralCode = newCode
    await user.save()

    res.status(200).json({ referralCode: newCode })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Promote a user to admin (for testing)
const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { secretKey } = req.body

    if (secretKey !== 'makeAdmin') {
      return res.status(403).json({ message: 'Invalid secret key' })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isAdmin = true
    await user.save()

    res.status(200).json({ message: 'User is now an admin' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  registerUser,
  signInUser,
  getProfile,
  generateReferralCode,
  makeAdmin,
}
