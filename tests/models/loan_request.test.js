import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import LoanRequest from '../../models/loan_request.js'
import User from '../../models/user.js'
import InterestTerm from '../../models/interest_term.js'
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

describe('LoanRequest model', () => {
  let user, interestTerm, crypto

  beforeEach(async () => {
    user = await User.create({ email: 'test@example.com', password: 'Password123' })
    interestTerm = await InterestTerm.create({ loan_length: 6, interest_rate: 10 })
    crypto = await Cryptocurrency.create({ name: 'Bitcoin', symbol: 'BTC' })
  })

  test('creates a valid loan request', async () => {
    const loan = new LoanRequest({
      borrower_id: user._id,
      request_amount: 500,
      interest_term: interestTerm._id,
      cryptocurrency: crypto._id
    })

    const saved = await loan.save()

    expect(saved._id).toBeDefined()
    expect(saved.status).toBe('pending')
    expect(saved.request_amount).toBe(500)
    expect(saved.request_date).toBeInstanceOf(Date)
    expect(saved.expiry_date > saved.request_date).toBe(true)
  })

  test('throws error if required fields are missing', async () => {
    const loan = new LoanRequest({})

    await expect(loan.save()).rejects.toThrow()
  })

  test('throws error if request amount is negative', async () => {
    const loan = new LoanRequest({
      borrower_id: user._id,
      request_amount: -100,
      interest_term: interestTerm._id,
      cryptocurrency: crypto._id
    })

    await expect(loan.save()).rejects.toThrow(/Request amount must be greater than 0/)
  })

  test('throws error if request date is in the future', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    const loan = new LoanRequest({
      borrower_id: user._id,
      request_amount: 1000,
      interest_term: interestTerm._id,
      cryptocurrency: crypto._id,
      request_date: futureDate
    })

    await expect(loan.save()).rejects.toThrow(/Request date cannot be in the future/)
  })

  test('throws error if expiry date is before request date', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)

    const loan = new LoanRequest({
      borrower_id: user._id,
      request_amount: 1000,
      interest_term: interestTerm._id,
      cryptocurrency: crypto._id,
      expiry_date: pastDate
    })

    await expect(loan.save()).rejects.toThrow()
  })

  test('throws error for invalid status value', async () => {
    const loan = new LoanRequest({
      borrower_id: user._id,
      request_amount: 1000,
      interest_term: interestTerm._id,
      cryptocurrency: crypto._id,
      status: 'invalid-status'
    })

    await expect(loan.save()).rejects.toThrow(/`invalid-status` is not a valid enum value for path `status`/)
  })
})