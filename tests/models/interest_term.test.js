import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import InterestTerm from '../../models/interest_term.js'

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


describe('InterestTerm Model', () => {
    test('should be defined', () => {
        expect(InterestTerm).toBeDefined()
    })

    test('creates and saves a valid collateral', async () => {
        const validInterestTerm = new InterestTerm({
            loan_length: 12,
            interest_rate: 7.9
        })

        const saved = await validInterestTerm.save()
        expect(saved._id).toBeDefined()
        expect(saved.loan_length).toBe(12)
        expect(saved.interest_rate).toBe(7.9)
    })

    test('throws validation error for missing fields', async () => {
        const term = new InterestTerm({})

        let err
        try {
            await term.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.loan_length).toBeDefined()
        expect(err.errors.interest_rate).toBeDefined()
    })

    test('throws error for non-integerloan length', async () => {
        const term = new InterestTerm({
            loan_length: 3.5,
            interest_rate: 10
        })

        await expect(term.save()).rejects.toThrow(/Loan length must be an integer/)
    })

    test('throws error when interest rate exceeds 100%', async () => {
        const term = new InterestTerm({
            loan_length: 12,
            interest_rate: 150
        })

        await expect(term.save()).rejects.toThrow(/Interest rate cannot exceed 100%/)
    })

    test('throws an error when loan length is less than 1', async () => {
        const term = new InterestTerm({
            loan_length: 0,
            interest_rate: 10
        })

        await expect(term.save()).rejects.toThrow(/Loan length must be at least 1 month/)
    })
})

