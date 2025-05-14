import { model, Schema } from "mongoose";

const loanRequestSchema = new Schema({
    borrower_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    request_amount: {
        type: Number,
        required: [true, 'Request amount is required'],
        min: [0, 'Request amount must be greater than 0']
    },
    interest_term: {
        type: Schema.Types.ObjectId,
        ref: 'InterestTerm',
        required: true
    },
    cryptocurrency: {
        type: Schema.Types.ObjectId,
        ref: 'Cryptocurrency',
        required: true
    },
    request_date: {
        type: Date,
        default: Date.now,
        validate: {
            validator: (v) => v <= Date.now(),
            message: 'Request date cannot be in the future'
        }
    },
    expiry_date: {
        type: Date,
        required: true,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 30); // Default to 30 days from today
            return date;
        },
        // Ensure expiry date is after request date
        validate: {
            validator: function (v) {
                return v > this.request_date;
            }
        }
    },
    status: {
        type: String,
        enum: ['pending', 'expired', 'funded'],
        default: 'active',
        required: true
    }
});

const LoanRequest = model('LoanRequest', loanRequestSchema)


export default LoanRequest