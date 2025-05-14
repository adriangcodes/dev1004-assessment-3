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
    default: function () {
      const loanDetails = this.loanDetails
      if (loanDetails) {
        const loanTerm = this.loanDetails.loanTerm
        const creationDate = this.createdAt || new Date() // Fallback to current date if createdAt is not set
        return new Date(creationDate.setMonth(creationDate.getMonth() + loanTerm))
      }
      return null
    }
  }
}, { timestamps: true })

const Deal = model('Deal', dealSchema)

export default Deal