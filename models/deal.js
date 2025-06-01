import { Schema, model } from 'mongoose'
import User from './user.js'
import LoanRequest from './loan_request.js'

const dealSchema = new Schema({
  lenderId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  loanDetails: {
    type: Schema.Types.ObjectId,
    ref: 'LoanRequest'
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  expectedCompletionDate: {
    type: Date,
    // Default is handled by pre-save hook
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
    await this.populate({
      path: 'loanDetails',
      populate: {
        path: 'interest_term',
        model: 'InterestTerm'
      }
    })

    const loanDetails = this.loanDetails
    if (!loanDetails || !loanDetails.interest_term) {
      return next(new Error('Loan details not found'))
    }

    // loan_length is in months on LoanRequest model
    const loanTermMonths = loanDetails.interest_term.loan_length
    const creationDate = loanDetails.createdAt || new Date()

    // Calculate expectedCompletionDate by adding loanTerm months to creationDate
    const expectedDate = new Date(creationDate)
    expectedDate.setMonth(expectedDate.getMonth() + loanTermMonths)

    this.expectedCompletionDate = expectedDate

    next()
  } catch (err) {
    next(err)
  }
})

const Deal = model('Deal', dealSchema)

export default Deal