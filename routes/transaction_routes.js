import { Router } from "express";   
import { auth, adminOnly } from "../auth.js";
import Transaction from "../models/transaction.js"
import User from "../models/user.js"
import Deal from "../models/deal.js"
import Wallet from "../models/wallet.js"

const router = Router()


// Get all transactions from all users (admin only)
router.get('/transactions', auth, adminOnly, async (req, res) => {
    try {
        // Find all transactions
        const transactions = await Transaction.find({})
        if (!transactions || transactions.length == 0) {
            return res.status(404).send({message: "No transactions found"})
        }
        // Send all transactions back to the client
        res.send(transactions)
    } catch(err) {
        res.status(500).send({ error: err.message })
    }
})

// // Get all transaction from a single user (authorised user only)
// router.get('/transactions/:id', auth, async (req, res) => {
//     const transactionId = req.params.id
//     // Fetch the transaction with the given id
//     try {
//         const transaction = await Transaction.findById(transactionId)
//     // Check the transaction exists, if not return error message
//     if (!transaction) {
//         return res.status(404).send({ error: `Transaction with id ${transactionId} not found.` })
//     }
//     // Check the user is accessing their own transaction data, if not return error message
//     if (transaction.userId.toString() !== req.user._id.toString()) {
//         return res.status(403).send({ error: 'Access denied: you are not authorised to view these transactions.' })
//     }
//     // Send transaction to client if it satisfies the above criteria
//     res.send(transaction)
//     } catch (err) {
//     res.status(500).send({ error: err.message })
//     }
// })

// Get all transactions for a user (authorised user only)
router.get('/transactions/user/:userId', auth, async (req, res) => {
    const userId = req.params.userId
    // Check if the user is trying to access their own transactions
    if (userId !== req.auth.id) {
        return res.status(403).send({ error: 'Access denied: you can only view your own transactions.' })
    }
    try {
        const transactions = await Transaction.find({
            $or: [{ fromUser: userId }, { toUser: userId }]
        }).populate('fromUser toUser fromWallet toWallet')
        if (!transactions || transactions.length == 0) {
            return res.status(404).send({message: "No transactions found"})
        }
        res.send(transactions)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

// Create a transaction (admin only)
router.post('/transactions', auth, adminOnly, async (req, res) => {
    try {
        // Check required fields
        const { fromUser, toUser, fromWallet, toWallet, dealId,  isLoanRepayment } = req.body
        // Check for required fields
        if (!fromUser || !toUser || !fromWallet || !toWallet || !dealId) {
            return res.status(400).send({ error: 'Missing required fields.' })
        }
        // Validate the above fields exist
        const fromUserExists = await User.findById(fromUser)
        const toUserExists = await User.findById(toUser)
        if (!fromUserExists || !toUserExists) {
            return res.status(400).send({ error: 'One or both users not found.' })
        }
        const fromWalletExists = await Wallet.findById(fromWallet)
        const toWalletExists = await Wallet.findById(toWallet)
        if (!fromWalletExists || !toWalletExists) {
            return res.status(400).send({ error: 'One or both wallets not found.' })
        }
        const dealExists = await Deal.findById(dealId)
        if (!dealExists) {
            return res.status(400).send({ error: 'Deal not found.' })
        }

        // Here we check if the transaction is a loan repayment
        // if yes, we create a repayment schedule
        // if no, we create a one off transaction
        if (isLoanRepayment) {
            //Generate full repayment schedule
            const transactions = await Transaction.generateRepaymentSchedule(dealId)
            return res.status(201).send(transactions)
        } else {
            const transaction = await Transaction.create(req.body)
            return res.status(201).send(transaction)
        }

    } catch(err) {
        res.status(400).send({ error: err.message })
    }
})

// Update transaction (admin only)
async function update(req, res) {
    try {
        const transactionId = req.params.id
        // Find transaction by id
        const transaction = await Transaction.findById(transactionId)
        // Return error if id does not exist
        if (!transaction) {
            return res.status(404).send({ error: `Transaction with id ${transactionId} not found.` })
        }
        // Perform the update
        const updatedWallet = await Transaction.findByIdAndUpdate(transactionId, req.body, { returnDocument: 'after' })
        // Send response to client
        res.status(200).send(updatedWallet)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

router.put('/transactions/:id', auth, adminOnly, update)
router.patch('/transactions/:id', auth, adminOnly, update)

// Delete transaction (admin only)
router.delete('/transactions/:id', auth, adminOnly, async (req, res) => {
    try {
        const transactionId = req.params.id
        const transaction = await Transaction.findByIdAndDelete(transactionId)
        if (transaction) {
            res.status(200).send({ message: 'Transaction deleted successfully.' })
        } else {
            res.status(404).send({ error: `Transaction with id ${transactionId} not found.` })
        }
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

export default router