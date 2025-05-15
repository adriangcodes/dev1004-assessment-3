import { Schema, model } from 'mongoose'
import User from './user.js'
import LoanRequest from './loan_request.js'

const dealSchema = new Schema({
  lenderId: {
    type: Schema.Types.ObjectId,
    ref: User
  },
  loanDetails: {
    type: Schema.Types.ObjectId,
    ref: LoanRequest
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  expectedCompletionDate: {
    type: Date,
    // Default will be whatever loan term the lender and borrower agree on
  }
}, { timestamps: true })



// Pre-save hook to set expectedCompletionDate
dealSchema.pre('save', async function (next) {
  if (!this.isModified('loanDetails') && this.expectedCompletionDate) {
    // If loanDetails didn't change and expectedCompletionDate is set, skip
    return next()
  }

  try {
    // Populate loanDetails to access loan term and creation date
    await this.populate('loanDetails')

    const loanDetails = this.loanDetails
    if (!loanDetails) {
      return next(new Error('Loan details not found'))
    }

    // loan_length is in months on LoanRequest model
    const loanTerm = loanDetails.loan_length || 0
    const creationDate = loanDetails.createdAt || new Date()

    // Calculate expectedCompletionDate by adding loanTerm months to creationDate
    const expectedDate = new Date(creationDate)
    expectedDate.setMonth(expectedDate.getMonth() + loanTerm)

    this.expectedCompletionDate = expectedDate

    next()
  } catch (err) {
    next(err)
  }
})

const Deal = model('Deal', dealSchema)

export default Deal