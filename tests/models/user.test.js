// tests/models/user.test.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/user.js';

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
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})

describe('User model', () => {
    it('should be defined', () => {
        expect(User).toBeDefined()
    })

    test('creates and saves a valid user', async () => {
        const validUser = new User({
            email: 'test@example.com',
            password: 'Password123'
        });

        const savedUser = await validUser.save();
        
        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe('test@example.com');
        expect(savedUser.password).toBe('Password123');
        expect(savedUser.isAdmin).toBe(false); // Default value
        expect(savedUser.isActive).toBe(true); // Default value
        expect(savedUser.createdAt).toBeDefined();
        expect(savedUser.updatedAt).toBeDefined();
    })

    test('trims and converts email to lowercase', async () => {
        const user = new User({
            email: '  TEST@EXAMPLE.COM  ',
            password: 'Password123'
        });

        const savedUser = await user.save();
        expect(savedUser.email).toBe('test@example.com')
    })

    test('throws error for invalid email format', async () => {
        const invalidEmailUser = new User({
            email: 'invalid-email',
            password: 'Password123'
        });

        let err;
        try {
            await invalidEmailUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.email).toBeDefined()
    })

    test('throws error for short email', async () => {
        const shortEmailUser = new User({
            email: 'a@',
            password: 'Password123'
        })

        let err
        try {
            await shortEmailUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.email).toBeDefined()
    })

    test('throws error for long email', async () => {
        // Create a very long email (over 200 chars)
        const longPart = 'a'.repeat(190)
        const longEmail = `${longPart}@example.com`
        
        const longEmailUser = new User({
            email: longEmail,
            password: 'Password123'
        })

        let err
        try {
            await longEmailUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.email).toBeDefined()
    })

    test('throws error for missing email', async () => {
        const noEmailUser = new User({
            password: 'Password123'
        })

        let err
        try {
            await noEmailUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.email).toBeDefined()
    })

    test('throws error for missing password', async () => {
        const noPasswordUser = new User({
            email: 'test@example.com'
        })

        let err
        try {
            await noPasswordUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.password).toBeDefined()
    })

    test('throws error for short password', async () => {
        const shortPasswordUser = new User({
            email: 'test@example.com',
            password: 'Short1'  // Less than 8 chars
        })

        let err
        try {
            await shortPasswordUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.password).toBeDefined()
    })

    test('throws error for long password', async () => {
        // Create a very long password (over 100 chars)
        const longPassword = 'L' + 'o'.repeat(98) + 'ng1';
        
        const longPasswordUser = new User({
            email: 'test@example.com',
            password: longPassword
        })

        let err
        try {
            await longPasswordUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.password).toBeDefined()
    })

    test('throws error for password without uppercase', async () => {
        const noUppercaseUser = new User({
            email: 'test@example.com',
            password: 'password123'  // No uppercase
        })

        let err
        try {
            await noUppercaseUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.password).toBeDefined()
    })

    test('throws error for password without lowercase', async () => {
        const noLowercaseUser = new User({
            email: 'test@example.com',
            password: 'PASSWORD123'  // No lowercase
        })

        let err
        try {
            await noLowercaseUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.password).toBeDefined()
    })

    test('throws error for password without number', async () => {
        const noNumberUser = new User({
            email: 'test@example.com',
            password: 'PasswordABC'  // No numbers
        })

        let err
        try {
            await noNumberUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        expect(err.errors.password).toBeDefined()
    })

    test('enforces email uniqueness', async () => {
        // Create first user
        const firstUser = new User({
            email: 'duplicate@example.com',
            password: 'Password123'
        })
        await firstUser.save()

        // Create second user with same email
        const duplicateUser = new User({
            email: 'duplicate@example.com',
            password: 'Password456'
        })

        let err
        try {
            await duplicateUser.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeDefined()
        // MongoDB duplicate key error has code 11000
        expect(err.code).toBe(11000)
    })

    test('creates admin user successfully', async () => {
        const adminUser = new User({
            email: 'admin@example.com',
            password: 'Password123',
            isAdmin: true
        })

        const savedUser = await adminUser.save()
        expect(savedUser.isAdmin).toBe(true)
    })

    test('sets isActive to false', async () => {
        const inactiveUser = new User({
            email: 'inactive@example.com',
            password: 'Password123',
            isActive: false
        })

        const savedUser = await inactiveUser.save()
        expect(savedUser.isActive).toBe(false)
    })
})