import { Router } from "express";   
import { auth, adminOnly } from "../auth.js";
import Wallet from "../models/wallet.js"
import User from "../models/user.js"
import Cryptocurrency from "../models/cryptocurrency.js";

const router = Router()
router.use(auth)

// Get all wallets from all users (admin only)
router.get('/wallets', auth, adminOnly, async (req, res) => {
    try {
        // Find all wallets
        const wallets = await Wallet.find({})
        // Send all wallets back to the client
        res.send(wallets)
    } catch(err) {
        res.status(500).send({ error: err.message })
    }
})

// Get all wallet from a single user (authorised user only)
router.get('/wallets/:id', auth, async (req, res) => {
    // Fetch the wallet with the given id
    try {
        const wallet = await Wallet.findById(req.params.id)
    // Check the wallet exists, if not return error message
    if (!wallet) {
        return res.status(404).send({ error: `Wallet with id ${req.params.id} not found.` })
    }
    // Check the user is accessing their own wallet data, if not return error message
    if (wallet.userId.toString() !== req.user._id.toString()) {
        return res.status(403).send({ error: 'Access denied: you are not authorised to view this wallet.' })
    }
    // Send wallet to client if it satisfies the above criteria
    res.send(wallet)
    } catch (err) {
    res.status(500).send({ error: err.message })
    }
})

// Create a wallet (authorised user only)
router.post('/wallets', auth, async (req, res) => {
    try {
        // Prevent user from creating wallets for other users
        if (req.body.userId && req.body.userId !== req.user._id.toString()) {
            return res.status(403).send({ error: 'You cannot create wallets for another user.' })
        }
        // Force userId to the authenticated user id
        req.body.userId = req.user._id
        // Create a new Wallet instance
        const wallet = await Wallet.create(req.body)
        // Send response to client
        res.status(201).send(wallet)
    } catch(err) {
        res.status(400).send({ error: err.message })
    }
 })

// Update wallet (authorised user only)
async function update(req, res) {
    try {
        // Find wallet by id
        const wallet = await Wallet.findById(req.params.id)
        // Return error if id does not exist
        if (!wallet) {
            return res.status(404).send({ error: `Wallet with id ${req.params.id} not found.` })
        }
        // Check the user is updating their own wallet
        if (wallet.userId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'Access denied: you do not have permission to update this wallet.' })
        }
        // Perform the update
        const updatedWallet = await Wallet.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
        // Send response to client
        res.status(200).send(updatedWallet)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

router.put('/wallets/:id', auth, update)
router.patch('/wallets/:id', auth, update)

// Delete wallet (admin only)
router.delete('/wallets/:id', auth, adminOnly, async (req, res) => {
    try {
        const walletId = req.params.id
        const wallet = await Wallet.findByIdAndDelete(walletId)
        if (wallet) {
            res.status(200).send({ message: 'Wallet deleted successfully.' })
        } else {
            res.status(404).send({ error: `Wallet with id ${walletId} not found.` })
        }
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

export default router