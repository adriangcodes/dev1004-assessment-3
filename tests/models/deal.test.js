// tests/models/deal.test.js
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Deal from '../../models/deal.js'
import User from '../../models/user.js'
import LoanRequest from '../../models/loan_request.js'
import InterestTerm from '../../models/interest_term.js' // adjust if needed
import Cryptocurrency from '../../models/cryptocurrency.js'

let mongo

beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    const uri = mongo.getUri()

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongo.stop()
})

afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})

describe('Deal model', () => {
    it('should be defined', () => {
        expect(Deal).toBeDefined()
    })

    test('should create a deal and compute expectedCompletionDate', async () => {
        const user = await User.create({ email: 'lender@example.com', password: 'Password123' })

        const crypto = await Cryptocurrency.create({ name: 'Bitcoin', symbol: 'BTC' })

        const interestTerm = await InterestTerm.create({
            interest_rate: 5,
            loan_length: 6 // months
        })

        const loanRequest = await LoanRequest.create({
            borrower_id: user._id,
            cryptocurrency: crypto._id,
            request_amount: 1000,
            interest_term: interestTerm._id
        })

        const deal = new Deal({
            lenderId: user._id,
            loanDetails: loanRequest._id
        })

        const saved = await deal.save()
        expect(saved._id).toBeDefined()
        expect(saved.isComplete).toBe(false)
        expect(saved.expectedCompletionDate).toBeInstanceOf(Date)

        const now = new Date()
        const expected = new Date(now)
        expected.setMonth(expected.getMonth() + 6)

        expect(saved.expectedCompletionDate.toISOString().slice(0, 10))
            .toBe(expected.toISOString().slice(0, 10))

    })

    test('throws an error when loanDetails is missing interest_term', async () => {
        const user = await User.create({ email: 'fail@example.com', password: 'Password123' })
        const crypto = await Cryptocurrency.create({ name: 'Bitcoin', symbol: 'BTC' })

        let error
        try {
            const loanRequest = await LoanRequest.create({
                borrower_id: user._id,
                cryptocurrency: crypto._id,
                request_amount: 1000
                // missing interest_term
            })

            const deal = new Deal({
                lenderId: user._id,
                loanDetails: loanRequest._id
            })


            await deal.save()

        } catch (err) {
            error = err
        }

        expect(error).toBeDefined()
        expect(error.message).toMatch(/LoanRequest validation failed: interest_term: Path `interest_term` is required./)
    })
})
