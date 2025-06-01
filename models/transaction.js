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
    // Max limit set based on initial operation of Bitcoin only - coin limit of 21 million
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
    // required: true
  },
  paymentStatus: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

// Pre-save hook to generate transaction based on an associated dealId
// The admin user is involved as this simulates the platform holding crypto on behalf of the lender and disbursing it once the deal is active. This simulates an escrow-style or trustless-intermediary pattern.
transactionSchema.statics.generateRepaymentSchedule = async function (dealId) {
  const deal = await Deal.findById(dealId).populate({
    path: 'loanDetails',
    populate: {
      path: 'interest_term',
      model: 'InterestTerm'
    }
  }).populate('lenderId')

  if (!deal || !deal.loanDetails || !deal.loanDetails.borrower_id) {
    throw new Error('Deal or borrower information missing')
  }

  const borrower = deal.loanDetails.borrower_id
  const lender = deal.lenderId
  const term = deal.loanDetails.interest_term
  const loanAmount = deal.loanDetails.request_amount
  const repaymentMonths = term.loan_length
  const interestRate = term.interest_rate

  if (!loanAmount || !repaymentMonths || !interestRate) {
    throw new Error('Missing loan amount, term length, or interest rate')
  }

  const monthlyRate = interestRate / 12 / 100
  const monthlyPayment = parseFloat(((loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -repaymentMonths))).toFixed(8))

  const fromWallet = await Wallet.findOne({ userId: borrower })
  const toWallet = await Wallet.findOne({ userId: lender })
  if (!fromWallet || !toWallet) throw new Error('Wallets not found')

  const startDate = new Date(deal.createdAt || Date.now())

  const transactions = []
  for (let i = 1; i <= repaymentMonths; i++) {
    const expectedDate = new Date(startDate)
    expectedDate.setMonth(startDate.getMonth() + i)

    transactions.push({
      dealId,
      fromUser: borrower,
      toUser: lender,
      fromWallet: fromWallet._id,
      toWallet: toWallet._id,
      amount: monthlyPayment,
      isLoanRepayment: true,
      expectedPaymentDate: expectedDate
    })
  }

  const admin = await User.findOne({ isAdmin: true })
  const borrowerWallet = await Wallet.findOne({ userId: borrower })

  if (!admin || !borrowerWallet) throw new Error('Admin or borrower wallet not found')
  
  transactions.push({
    dealId,
    fromUser: admin._id,
    toUser: borrower,
    fromWallet: admin.walletId,
    toWallet: borrowerWallet._id,
    amount: loanAmount,
    isLoanRepayment: false,
    expectedPaymentDate: new Date(startDate.setMonth(startDate.getMonth() + repaymentMonths))
  })

  return await this.insertMany(transactions)
}

const Transaction = model('Transaction', transactionSchema)

export default Transaction