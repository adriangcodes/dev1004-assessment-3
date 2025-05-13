import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  walletId: {
    type: String,
    required: [true, 'Please enter a valid Wallet ID.'],
    unique: true,
    minLength: 1,
    maxLength: 200
  },
  email: {
    type: String,
    required: [true, 'Please enter a valid email address.'],
    unique: true,
    minLength: 3,
    maxLength: 200,
    match: [/.+@.+\..+/, 'Please enter a valid email address.'],
    lowercase: true,
    trim: true
    },
  password: {
    type: String,
    required: [true, 'Please enter a valid password.'],
    minLength: [8, 'Password must be at least 8 characters.'],
    maxLength: 100,
    validate: {
      validator: function (v) {
        return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(v)
      },
      message: props => 'Password must include upper/lowercase letters and a number.'
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Needed to add a field for the user's wallet balance so when we fund a loan we can check if the user has enough balance
  // The way to add a wallet balance in seed is as follows:
  // wallet: {
  //     BTC: 3.5,
  //     ETH: 10
  // }
  wallet : {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true })

const User = model('User', userSchema)

export default User