import { Router } from "express";   
import { auth, adminOnly } from "../auth.js";
import InterestTerm from "../models/interest_term.js"

const router = Router()
router.use(auth)

// Get all interest terms (authorised user only)
router.get('/interest-terms', auth, async (req, res) => {
    try {
        // Find all interest terms
        const terms = await InterestTerm.find({})
        // Send all interest terms back to the client
        res.send(terms)
    } catch(err) {
        res.status(500).send({ error: err.message })
    }
})

// Get a single interest term (authorised user only)
router.get('/interest-terms/:id', auth, async (req, res) => {
    const termId = req.params.id
    // Fetch the interest term with the given id
    try {
        const term = await InterestTerm.findById(termId)
    // Check the wallet exists, if not return error message
    if (!term) {
        return res.status(404).send({ error: `Interest term with id ${termId} not found.` })
    }
    // Send interest term to client
    res.send(term)
    } catch (err) {
    res.status(500).send({ error: err.message })
    }
})

// Create an interest term (admin only)
router.post('/interest-terms', auth, adminOnly, async (req, res) => {
    try {
        // Create a new InterestTerm instance
        const term = await InterestTerm.create(req.body)
        // Send response to client
        res.status(201).send(term)
    } catch(err) {
        res.status(400).send({ error: err.message })
    }
 })

// Update interest term (admin only)
async function update(req, res) {
    try {
        const termId = req.params.id
        // Find interest term by id
        const term = await InterestTerm.findById(termId)
        // Return error if id does not exist
        if (!term) {
            return res.status(404).send({ error: `Interest term with id ${termId} not found.` })
        }
        // Perform the update
        const updatedTerm = await InterestTerm.findByIdAndUpdate(termId, req.body, { returnDocument: 'after' })
        // Send response to client
        res.status(200).send(updatedTerm)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

router.put('/interest-terms/:id', auth, adminOnly, update)
router.patch('/interest-terms/:id', auth, adminOnly, update)

// Delete wallet (admin only)
router.delete('/interest-terms/:id', auth, adminOnly, async (req, res) => {
    try {
        const termId = req.params.id
        const term = await InterestTerm.findByIdAndDelete(termId)
        if (term) {
            res.status(200).send({ message: 'Interest term deleted successfully.' })
        } else {
            res.status(404).send({ error: `Interest term with id ${termId} not found.` })
        }
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

export default router