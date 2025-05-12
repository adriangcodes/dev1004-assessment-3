import { model, Schema } from "mongoose";

const loanRequestsSchema = new Schema({
    borrower_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    request_amount: {
        type: Number,
        required: [true, 'Request amount is required'],
        min: [0, 'Request amount must be greater than 0']
    },
    interest_term: {
        type: Schema.Types.ObjectId,
        ref: 'InterestTerms',
        required: true
    },
    cryptocurrency: {
        type: Schema.Types.ObjectId,
        ref: 'Cryptocurrencies',
        required: true
    },
    request_date: {
        type: Date,
        default: Date.now
    },
    expiry_date: {
        type: Date,
        required: true
    }
});

const LoanRequests = model('LoanRequests', loanRequestsSchema)


export default LoanRequests