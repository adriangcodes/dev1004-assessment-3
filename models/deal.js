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
  }
}, { timestamps: true })

const Deal = model('Deal', dealSchema)

export default Deal