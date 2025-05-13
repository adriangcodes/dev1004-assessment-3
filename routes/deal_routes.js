import { Router } from "express";   
import { auth, adminOnly } from "../auth.js";
import Deal from "../models/deal.js"
import User from "../models/user.js"
import LoanRequest from "../models/loan_request.js";

const router = Router()
router.use(auth)

// Get all deals (authorised user only)
router.get('/deals', auth, async (req, res) => {
    try {
        // Draft query string returns all deals, otherwise only incomplete deals are shown
        const deals = await Deal.find(req.query.draft ? {} : { isComplete: false })
        res.send(deals)
    } catch(err) {
        res.status(500).send({ error: err.message })
    }
})

// Get one deal (authorised user only)
router.get('/deals/:id', auth, async (req, res) => {
    // Get the id of the deal
    const dealId = req.params.id
    // Get the deal with the given id
    const deal = await Deal.find({ _id: dealId })
    // Send the deal back to the client
    if (deal) {
        res.send(deal)
    } else {
        res.status(404).send({error: `Deal with id ${dealId} not found.`})
    }
})

// Create deal (authorised user only)
router.post('/deals', auth, async (req, res) => {
    try {
        // Get post data from request body
        const bodyData = req.body
        // Validate lenderId exists
        const lenderExists = await User.findById(bodyData.lenderId)
        if (!lenderExists) {
            return res.status(400).send({ error: 'Lender user not found.' })
        }
        // Validate loanDetails exists
        const loanRequestExists = await LoanRequest.findById(bodyData.loanDetails)
        if (!loanRequestExists) {
            return res.status(400).send({ error: 'Loan request not found.' })
        }
        // Create a new Deal instance
        const deal = await Deal.create(bodyData)
        // Send response to client
        res.status(201).send(deal)
    } catch(err) {
        res.status(400).send({ error: err.message })
    }
 })

// Update deal (authorised user only)

// Delete deal (admin only)

export default router