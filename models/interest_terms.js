import { model, Schema } from "mongoose";

const interestTermsSchema = new Schema({
    loan_length: { 
        type: Number, 
        required: true 
    },
    interest_rate: { 
        type: Number, 
        required: true 
    }
});

const InterestTerms = model('InterestTerms', interestTermsSchema)


export default InterestTerms