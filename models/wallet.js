import { Schema, model } from 'mongoose'
import User from './user.js'
import Cryptocurrency from './cryptocurrency.js'

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    cryptoType: {
        type: Schema.Types.ObjectId,
        ref: Cryptocurrency
    },
    amount: {
        type: Number,
        min: [0, 'Wallet cannot have a negative amount of coins.'],
        // Max limit set based on initial operation of Bitcoin only
        max: [21000000, 'Amount cannot exceed 21 million.'],
        validate: {
        // Validates amount entry to ensure it has a maximum of 8 decimal places, and that a numeral features before the decimal place (ie. 0.5 not .5)
        validator: function (v) {
            return /^\d+(\.\d{1,8})?$/.test(v.toString())
        },
        message: 'Amount must be a number with up to 8 decimal places'
        }
    }
}, { timestamps: true })

const Wallet = model('Wallet', walletSchema)

export default Wallet