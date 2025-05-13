import { Schema, model } from 'mongoose'
import LoanRequest from './loan_request.js'

const dealSchema = new Schema({
  lender_id: {
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