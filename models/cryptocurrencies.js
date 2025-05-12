import { model, Schema } from "mongoose";

const cryptocurrenciesSchema = new Schema({
    symbol: {
        type: String,
        required: true,
        maxLength: 3,
        minLength: 3
    },
    name: {
        type: String,
        maxLength: 50,
        required: true
    }
});

const Cryptocurrencies = model('Cryptocurrencies', cryptocurrenciesSchema)


export default Cryptocurrencies