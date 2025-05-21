import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Collateral from '../../models/collateral.js' // adjust path if needed

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


describe('Collateral model', () => {
  it('should be defined', () => {
    expect(Collateral).toBeDefined()
  })
})

describe('Collateral Model', () => {
  test('creates and saves a valid collateral', async () => {
    const validCollateral = new Collateral({
      deal_id: new mongoose.Types.ObjectId(),
      amount: 1.25,
      status: 'locked',
    })

    const saved = await validCollateral.save()
    expect(saved._id).toBeDefined()
    expect(saved.status).toBe('locked')
    expect(saved.amount).toBe(1.25)
  })

  test('defaults status to pending', async () => {
    const collateral = new Collateral({
      deal_id: new mongoose.Types.ObjectId(),
      amount: 2.5
    })

    const saved = await collateral.save()
    expect(saved.status).toBe('pending')
  })

  test('throws validation error for missing amount', async () => {
    const invalidCollateral = new Collateral({
      deal_id: new mongoose.Types.ObjectId(),
    })

    let err
    try {
      await invalidCollateral.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeDefined()
    expect(err.errors.amount).toBeDefined()
  })

  test('throws error for future date_created', async () => {
    const futureDate = new Date(Date.now() + 1000000)

    const collateral = new Collateral({
      deal_id: new mongoose.Types.ObjectId(),
      amount: 3.5,
      date_created: futureDate
    })

    let err
    try {
      await collateral.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeDefined()
    expect(err.errors.date_created).toBeDefined()
  })
})
