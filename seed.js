import bcrypt from 'bcrypt'
import db from './db.js'
import User from './models/user.js'
import Cryptocurrency from './models/cryptocurrency.js'
import InterestTerm from './models/interest_term.js'

// Connect to DB
db.connect()

// User seed data
const users = [
    {
        walletId: '12345678ABCD',
        email: 'admin@example.com',
        password: await bcrypt.hash('Password123', 10),
        isAdmin: true
    },
    {
        walletId: 'ABCD87654321',
        email: 'hodl@satoshi.com',
        password: await bcrypt.hash('1Password', 10)
    },
]


// Erase any existing Users
await User.deleteMany()
console.log('Users erased.')
// Creates and saves a new User to MongoDB for each document in users
const u = await User.create(users)
console.log('Users created.')

// Cryptocurrency seed data
const cryptocurrencies = [
    {
        symbol: 'BTC',
        name: 'Bitcoin'
    },
    {
        symbol: 'ETH',
        name: 'Ethereum'
    },
    {
        symbol: 'LTC',
        name: 'Litecoin'
    },
    {
        symbol: 'XRP',
        name: 'Ripple'
    },
    {
        symbol: 'DOGE',
        name: 'Dogecoin'
    },
    {
        symbol: 'SOL',
        name: 'Solana'
    },
    {
        symbol: 'BNB',
        name: 'Binance Coin'
    },
    {
        symbol: 'ADA',
        name: 'Cardano'
    },
    {
        symbol: 'DOT',
        name: 'Polkadot'
    },
    {
        symbol: 'MATIC',
        name: 'Polygon'
    }
]

await Cryptocurrency.deleteMany()
console.log('Cryptocurrencies erased.')
// Creates and saves the cryptocurrencies to MongoDB
const c = await Cryptocurrency.create(cryptocurrencies)
console.log('Cryptocurrencies created.')


// Interest Term seed data
const interestTerm = [
    {
        loan_length: 1,
        interest_rate: 5.9
    },
    {
        loan_length: 3,
        interest_rate: 5.7
    },
    {
        loan_length: 6,
        interest_rate: 5.9
    }
]

await InterestTerm.deleteMany()
console.log('Interest terms erased.')
// Creates and saves the interest terms to MongoDB
const i = await InterestTerm.create(interestTerm)
console.log('Interest terms created.')

// Disconnect from DB
db.disconnect()