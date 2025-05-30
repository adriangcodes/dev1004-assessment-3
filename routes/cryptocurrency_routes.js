import { Router } from "express";   
import { auth, adminOnly } from "../auth.js";
import Cryptocurrency from "../models/cryptocurrency.js";

const router = Router()


// Get all cryptocurrencies (authorised user only)
router.get('/crypto', auth, async (req, res) => {
    try {
        // Find all cryptocurrencies
        const crypto = await Cryptocurrency.find({})
        // Send all cryptocurrencies back to the client
        res.send(crypto)
    } catch(err) {
        res.status(500).send({ error: err.message })
    }
})

// Get one cryptocurrency (authorised user only)
router.get('/crypto/:id', auth, async (req, res) => {
    const cryptoId = req.params.id
    // Fetch the crypto with the given id
    try {
        const crypto = await Cryptocurrency.findById(cryptoId)
    // Check the crypto exists, if not return error message
    if (!crypto) {
        return res.status(404).send({ error: `Cryptocurrency with id ${cryptoId} not found.` })
    }
    // Send crypto to client
    res.send(crypto)
    } catch (err) {
    res.status(500).send({ error: err.message })
    }
})

// Create a new coin (admin only)
router.post('/crypto', auth, adminOnly, async (req, res) => {
    try {
        // Create a new Cryptocurrency instance
        const crypto = await Cryptocurrency.create(req.body)
        // Send response to client
        res.status(201).send(crypto)
    } catch(err) {
        res.status(400).send({ error: err.message })
    }
 })

// Update crypto (admin only)
async function update(req, res) {
    try {
        const cryptoId = req.params.id
        // Find crypto by id
        const crypto = await Cryptocurrency.findById(cryptoId)
        // Return error if id does not exist
        if (!crypto) {
            return res.status(404).send({ error: `Cryptocurrency with id ${cryptoId} not found.` })
        }
        // Perform the update
        const updatedWallet = await Cryptocurrency.findByIdAndUpdate(cryptoId, req.body, { returnDocument: 'after' })
        // Send response to client
        res.status(200).send(updatedWallet)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

router.put('/crypto/:id', auth, adminOnly, update)
router.patch('/crypto/:id', auth, adminOnly, update)

// Delete crypto (admin only)
router.delete('/crypto/:id', auth, adminOnly, async (req, res) => {
    try {
        const cryptoId = req.params.id
        const crypto = await Cryptocurrency.findByIdAndDelete(cryptoId)
        if (crypto) {
            res.status(200).send({ message: 'Cryptocurrency deleted successfully.' })
        } else {
            res.status(404).send({ error: `Cryptocurrency with id ${cryptoId} not found.` })
        }
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

export default router