import { Schema, model } from 'mongoose'
import User from './user.js'
import Wallet from './wallet.js'
import Deal from './deal.js'

const transactionSchema = new Schema({
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: User
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: User
  },
  fromWallet: {
    type: Schema.Types.ObjectId,
    ref: Wallet
  },
  toWallet: {
    type: Schema.Types.ObjectId,
    ref: Wallet
  },
  dealId: {
    type: Schema.Types.ObjectId,
    ref: Deal
  },
  amount: {
      type: Number,
      min: [0, 'Transaction amount cannot be negative.'],
      // Max limit set based on initial operation of Bitcoin only
      max: [21000000, 'Amount cannot exceed 21 million.'],
      validate: {
      // Validates amount entry to ensure it has a maximum of 8 decimal places, and that a numeral features before the decimal place (ie. 0.5 not .5)
      validator: function (v) {
          return /^\d+(\.\d{1,8})?$/.test(v.toString())
      },
      message: 'Amount must be a number with up to 8 decimal places'
      }
  },
  isLoanRepayment: {
    type: Boolean,
    required: true
  },
  expectedPaymentDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Transaction = model('Transaction', transactionSchema)

export default Transaction