// backend/models/User.js

const mongoose = require('mongoose')

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

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referralReward: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  // Single interested category field with enum validation
  interestedCategory: {
    type: String,
    enum: categories,
    required: true,
    trim: true,
  },
})

module.exports = mongoose.model('User', userSchema)
