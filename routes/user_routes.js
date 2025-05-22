import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/user.js'
import { adminOnly, auth } from '../auth.js'
import Wallet from '../models/wallet.js'
import Deal from '../models/deal.js'

const secret = process.env.JWT_SECRET
const router = Router()

// Register a new user
router.post('/register', async (req, res) => {
    try {
        // Get post data from the request body
        const bodyData = req.body
        // Create and save new User instance
        const user = await User.create({
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10)
        })
        // Send user to the client with 201 status
        // Note: only sending email, password should not get sent outside of the db
        // TODO: Create a JWT so the user is automatically logged in
        res.status(201).send({ email: user.email })
    }
    catch (err) {
        // TODO: Log to error file
        res.status(400).send({ error: err.message })
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        // Find the user with the provided email
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            // Validate the password
            const match = await bcrypt.compare(req.body.password || '', user.password)
            // if (match) {
            //     // Generate a JWT and send it to the client
            //     const token = jwt.sign({
            //         id: user._id.toString(),
            //         email: user.email,
            //         exp: Math.floor(Date.now() / 1000) + (60 * 120) // 2 hour window
            //     }, secret)

            if (!match) {
                return res.status(401).send({ error: "Invalid Credentials" })
            }

            const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV == 'production',
                sameSite: 'None',
                maxAge: 1000 * 60 * 60 // 1 Hour
            })

            res.send({ token, email: user.email, isAdmin: user.isAdmin })
        } else {
            res.status(404).send({ error: 'Email or password incorrect.' })
        }
}
    catch (err) {
    // TODO: Log to error file
    res.status(400).send({ error: err.message })
}
})

// ADMIN Route - Get All Users
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find()
        if (!users) {
            return res.status(404).send({ error: "No Users Found" })
        }

        res.send(users)

    } catch (err) {

        res.status(500).send({ error: err.message })
    }
})

// Update user - own profile (authorised user only)
router.put('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.auth.id)
        if (!user) {
            return res.status(404).send({ error: `User with id ${req.auth.id} not found.` })
        }
        const updatedUser = await User.findByIdAndUpdate(req.auth.id, req.body, { returnDocument: 'after' })
        res.status(200).send(updatedUser)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

// Update any user (admin only)
router.put('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send({ error: `User with id ${userId} not found.` })
        }
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { returnDocument: 'after' })
        res.status(200).send(updatedUser)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

// Delete user (admin only)
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        const userId = req.params.id
        const deletedUser = await User.findByIdAndDelete(userId)
        if (!deletedUser) {
            return res.status(404).send({ error: "User not found" })
        }
        res.status(200).send({ message: "User deleted successfully" })
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

export default router
