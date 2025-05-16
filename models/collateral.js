import { model, Schema } from "mongoose";

const collateralSchema = new Schema({
    deal_id: {
        type: Schema.Types.ObjectId,
        ref: 'Deal',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'locked', 'released', 'forfeited'],
        default: 'pending',
        required: true
    },
    date_created: {
        type: Date,
        default: Date.now,
        validate: {
            validator: (v) => v <= Date.now(),
            message: 'Date created cannot be in the future'
        }
    }
});

const Collateral = model('Collateral', collateralSchema)


export default Collateral