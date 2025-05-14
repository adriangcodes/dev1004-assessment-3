import bcrypt from 'bcrypt'
import db from './db.js'
import User from './models/user.js'
import Cryptocurrency from './models/cryptocurrency.js'
import InterestTerm from './models/interest_term.js'
import LoanRequest from './models/loan_request.js'
import Wallet from './models/wallet.js'
// Connect to DB
db.connect()

// User seed data
const users = [
    {
        walletId: '12345678ABCD',
        email: 'admin@example.com',
        password: await bcrypt.hash('Password123', 10),
        isAdmin: true,
        wallet: {
            BTC: 3.5
        }
    },
    {
        walletId: 'ABCD87654321',
        email: 'hodl@satoshi.com',
        password: await bcrypt.hash('1Password', 10),
        wallet: {
            BTC: 0.5
        }
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
    }
    // Will look at adding other cryptocurrencies in the future
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

// Loan request seed data
await LoanRequest.deleteMany()
console.log('Loan Requests have been erased')

// Wallet seed data
await Wallet.deleteMany()
console.log('Wallets have been erased')

// Disconnect from DB
db.disconnect()