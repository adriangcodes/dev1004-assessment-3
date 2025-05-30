import 'dotenv/config'
import bcrypt from 'bcrypt'
import db from './db.js'
import User from './models/user.js'
import Cryptocurrency from './models/cryptocurrency.js'
import InterestTerm from './models/interest_term.js'
import LoanRequest from './models/loan_request.js'
import Wallet from './models/wallet.js'
import Deal from './models/deal.js'
import Collateral from './models/collateral.js'
import Transaction from './models/transaction.js'

// Connect to DB
db.connect()

// User seed data
const users = [
    {
        email: 'admin@app.com',
        password: await bcrypt.hash('Password123', 10),
        isAdmin: true
    },
    {
        email: 'hodl@satoshi.com',
        password: await bcrypt.hash('1Password', 10)
    },
    {
        email: 'degen@daytrade.com',
        password: await bcrypt.hash('2thamoon!', 10)
    },
    {
        email: 'memecoins@amc.com',
        password: await bcrypt.hash('1loveEthereum!', 10)
    },
    {
        email: 'nayib@elsal.com',
        password: await bcrypt.hash('ElSalvador1!', 10)
    }
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
        interest_rate: 5.5
    }
]

await InterestTerm.deleteMany()
console.log('Interest terms erased.')
// Creates and saves the interest terms to MongoDB
const i = await InterestTerm.create(interestTerm)
console.log('Interest terms created.')

// Loan Request seed data
const loanRequest = [
    {
        borrower_id: u[2]._id,
        request_amount: 0.5,
        interest_term: i[1]._id,
        cryptocurrency: c[0]._id,
        request_date: Date.now(),
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
        borrower_id: u[3]._id,
        request_amount: 0.1,
        interest_term: i[0]._id,
        cryptocurrency: c[0]._id,
        request_date: Date.now(),
        expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
    {
        borrower_id: u[3]._id,
        request_amount: 1,
        interest_term: i[2]._id,
        cryptocurrency: c[0]._id,
        request_date: Date.now(),
        expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    }
]

await LoanRequest.deleteMany()
console.log('Loan Requests have been erased')
const lr = await LoanRequest.create(loanRequest);
console.log('Loan Requests have been created')

await Deal.deleteMany()
console.log('Deals have been erased')

await Collateral.deleteMany()
console.log('Collateral has been erased')

// Wallet seed data
const wallet = [
    {
        userId: u[0]._id,
        cryptoType: c[0]._id,
        balance: 20.20000000
    },
    {
        userId: u[1]._id,
        cryptoType: c[0]._id,
        balance: 8.81769123
    },
    {
        userId: u[2]._id,
        cryptoType: c[0]._id,
        balance: 2.51242000
    },
    {
        userId: u[3]._id,
        cryptoType: c[0]._id,
        balance: 1.11111000
    },
    {
        userId: u[4]._id,
        cryptoType: c[0]._id,
        balance: 10000.00000000
    }
]
await Wallet.deleteMany()
console.log('Wallets have been erased')
const wal = await Wallet.create(wallet);
console.log('Wallets have been seeded')

await Transaction.deleteMany()
console.log('Transactions have been erased')

// Disconnect from DB
db.disconnect()