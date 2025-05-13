import { Schema, model } from 'mongoose'
import LoanRequests from './loan_requests'

// TODO: Update LoanRequests when pluralisation is corrected
const dealSchema = new Schema({
  lender_id: {
    type: Schema.Types.ObjectId,
    ref: LoanRequests
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Deal = model('Deal', dealSchema)

export default Deal