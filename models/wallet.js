import { Schema, model } from 'mongoose';

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Ensure this matches the model name
        required: true
    },
    cryptoType: {
        type: Schema.Types.ObjectId,
        ref: 'Cryptocurrency', // Ensure this matches the model name
    },
    balance: {
        type: Number,
        min: [0, 'Wallet cannot have a negative amount of coins.'],
        max: [21000000, 'Amount cannot exceed 21 million.'],
        validate: {
            validator: function (v) {
                return /^\d+(\.\d{1,8})?$/.test(v.toString());
            },
            message: 'Amount must be a number with up to 8 decimal places'
        },
        default: 0 // Optional: Set a default value if needed
    }
}, { timestamps: true });

const Wallet = model('Wallet', walletSchema);

export default Wallet;