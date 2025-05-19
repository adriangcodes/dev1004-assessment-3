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

// Get wallet balance
router.get('/wallet-balance', auth, async (req, res) => {
    try {
        // Get the user ID from the JWT token
        const userId = req.auth.id

        // Get the wallet Id that user userID uses
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found for user" })
        }

        return res.json({ walletBalance: wallet.balance })
    } catch (err) {
        res.send({ error: err.message })
    }
})

// Code below has been commented out as we only have a single wallet per user at this stage.

// // Get all wallet from a single user (authorised user only)
// router.get('/wallets/:id', auth, async (req, res) => {
//     const walletId = req.params.id
//     // Fetch the wallet with the given id
//     try {
//         const wallet = await Wallet.findById(walletId)
//     // Check the wallet exists, if not return error message
//     if (!wallet) {
//         return res.status(404).send({ error: `Wallet with id ${walletId} not found.` })
//     }
//     // Check the user is accessing their own wallet data, if not return error message
//     if (wallet.userId.toString() !== req.user._id.toString()) {
//         return res.status(403).send({ error: 'Access denied: you are not authorised to view this wallet.' })
//     }
//     // Send wallet to client if it satisfies the above criteria
//     res.send(wallet)
//     } catch (err) {
//     res.status(500).send({ error: err.message })
//     }
// })

// Create a wallet (authorised user only)
router.post('/wallets', auth, async (req, res) => {
    try {

        const userId = req.auth.id

        // First check to see if a wallet already exists for the user
        const existingWallet = await Wallet.findOne({ userId})
        if (existingWallet) {
            return res.status(409).send({ error: "Wallet already exists for this user."})
        }

        const newWallet = await Wallet.create({
            userId,
            balance: 0
        })
        
        res.status(201).send(newWallet)
    } catch(err) {
        res.status(400).send({ error: err.message })
    }
 })

// Deposit Funds (authorised user only)
async function update(req, res) {
    try {
        const userId = req.auth.id

        // Find wallet
        const wallet = await Wallet.findOne({ userId})
        if (!wallet) {
            return res.status(404).send({ message :"No wallet exists for this user, please create one first."})
        }
        
        // Will look in the body of the request for the fundsDeposited
        let updateBalance = req.body.fundsDeposited

        // Update the wallet to now have the new fundsDeposited
        updateBalance += wallet.balance
        
        const updatedWallet = await Wallet.findByIdAndUpdate(
            wallet._id,
            { balance: updateBalance},
            { returnDocument: 'after'})

        res.send(updatedWallet)

    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

// Deposit funds into wallet
router.put('/wallets', auth, update)
router.patch('/wallets', auth, update)

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