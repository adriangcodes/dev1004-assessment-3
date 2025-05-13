import bcrypt from 'bcrypt'
import db from './db.js'
import User from './models/user.js'

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

// Disconnect from DB
db.disconnect()