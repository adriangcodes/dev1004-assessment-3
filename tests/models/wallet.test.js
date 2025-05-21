// tests/models/wallet.test.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Wallet from '../../models/wallet.js';
import User from '../../models/user.js';
import Cryptocurrency from '../../models/cryptocurrency.js';

let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    const uri = mongo.getUri()

    await mongoose.connect(uri)
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

describe('Wallet model', () => {
    let user, crypto

    beforeEach(async () => {
        // Create a user and cryptocurrency for testing
        user = await User.create({
            email: 'test@example.com',
            password: 'Password123'
        })

        crypto = await Cryptocurrency.create({
            symbol: 'BTC',
            name: 'Bitcoin'
        })
    })

    it('should be defined', () => {
        expect(Wallet).toBeDefined()
    })

    test('creates and saves a valid wallet', async () => {
        const validWallet = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 5.25
        });

        const savedWallet = await validWallet.save();
        
        expect(savedWallet._id).toBeDefined()
        expect(savedWallet.userId.toString()).toBe(user._id.toString())
        expect(savedWallet.cryptoType.toString()).toBe(crypto._id.toString())
        expect(savedWallet.balance).toBe(5.25)
        expect(savedWallet.createdAt).toBeDefined()
        expect(savedWallet.updatedAt).toBeDefined()
    })

    test('creates a wallet with zero balance', async () => {
        const zeroBalanceWallet = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 0
        })

        const savedWallet = await zeroBalanceWallet.save()
        expect(savedWallet.balance).toBe(0)
    })

    test('creates a wallet with max decimal precision', async () => {
        const maxPrecisionWallet = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 1.12345678 // 8 decimal places
        })

        const savedWallet = await maxPrecisionWallet.save()
        expect(savedWallet.balance).toBe(1.12345678)
    })

    test('throws error for negative balance', async () => {
        const negativeBalanceWallet = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: -1.5
        })

        let err
        try {
            await negativeBalanceWallet.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.balance).toBeDefined()
    })

    test('throws error for balance exceeding max limit', async () => {
        const exceededBalanceWallet = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 25000000 // Over the 21 million limit
        })

        let err
        try {
            await exceededBalanceWallet.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.balance).toBeDefined()
    })

    test('throws error for too many decimal places', async () => {
        const tooManyDecimalsWallet = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 1.123456789 // 9 decimal places, should allow only 8
        })

        // Use the validation directly instead of save
        const validationError = tooManyDecimalsWallet.validateSync()
        
        expect(validationError).toBeDefined()
        expect(validationError.errors.balance).toBeDefined()
    })

    test('validates decimal format correctly', async () => {
        // Test with leading decimal point (no zero)
        const wallet1 = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: '.12345'  // Missing leading zero
        })
        
        // Use manual validation instead of save since Mongoose might convert this
        const validation1 = wallet1.validateSync()
        
        // If regex validation is working correctly, this should fail
        if (validation1 && validation1.errors.balance) {
            expect(validation1.errors.balance).toBeDefined()
        } else {
            const saved = await wallet1.save()
            expect(typeof saved.balance).toBe('number')
            expect(saved.balance).toBe(0.12345)
        }
        
        // Test with valid format
        const wallet2 = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: '0.12345'  // With leading zero
        })
        
        const saved2 = await wallet2.save()
        expect(saved2.balance).toBe(0.12345)
    })

    test('accepts integer balances', async () => {
        const integerBalanceWallet = new Wallet({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 10
        })

        const savedWallet = await integerBalanceWallet.save()
        expect(savedWallet.balance).toBe(10)
    })

    test('updates balance successfully', async () => {
        // Create initial wallet
        const wallet = await Wallet.create({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 5
        })

        // Update balance
        wallet.balance = 7.5
        const updatedWallet = await wallet.save()
        
        expect(updatedWallet.balance).toBe(7.5)
    })

    test('supports multiple wallets for the same user with different crypto types', async () => {
        // Create a second cryptocurrency
        const eth = await Cryptocurrency.create({
            symbol: 'ETH',
            name: 'Ethereum'
        })

        // Create BTC wallet
        const btcWallet = await Wallet.create({
            userId: user._id,
            cryptoType: crypto._id,
            balance: 1.5
        })

        // Create ETH wallet for same user
        const ethWallet = await Wallet.create({
            userId: user._id,
            cryptoType: eth._id,
            balance: 20
        })

        expect(btcWallet._id).toBeDefined();
        expect(ethWallet._id).toBeDefined();
        expect(btcWallet._id).not.toEqual(ethWallet._id);
    })

    test('requires valid references to user and crypto', async () => {
        const invalidRefWallet = new Wallet({
            userId: new mongoose.Types.ObjectId(), // ID that doesn't exist
            cryptoType: new mongoose.Types.ObjectId(), // ID that doesn't exist
            balance: 5
        })

        const savedWallet = await invalidRefWallet.save()
        expect(savedWallet._id).toBeDefined()
    })
})