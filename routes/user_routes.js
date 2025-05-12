import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/user.js'

const secret = process.env.JWT_SECRET
const router = Router()

// Register a new user
router.post('/register', async (req, res) => {
    try {
        // Get post data from the request body
        const bodyData = req.body
        // Create and save new User instance
        const user = await User.create({
            walletId: req.body.walletId,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10)
        })
        // Send user to the client with 201 status
        // Note: only sending email, password should not get sent outside of the db
        // TODO: Create a JWT so the user is automatically logged in
        res.status(201).send({ email: user.email })
    }
    catch(err) {
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
            if (match) {
                // Generate a JWT and send it to the client
                const token = jwt.sign({
                    email: user.email,
                    exp: Math.floor(Date.now() / 1000) + (60 * 120) // 2 hour window
                }, secret)
                res.send({ token, email: user.email })
            } else {
                res.status(404).send({ error: 'Email or password incorrect.' })
            }
        } else {
            res.status(404).send({ error: 'Email or password incorrect.' })
        }
    }
    catch(err) {
        // TODO: Log to error file
        res.status(400).send({ error: err.message })
    }
})

export default router
