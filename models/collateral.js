import { model, Schema } from "mongoose";

const collateralSchema = new Schema({
    deal_id: {
        // TODO: Add a reference to the deal model
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    }
});

const Collateral = model('Collateral', collateralSchema)


export default Collateral