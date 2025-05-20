import { Router } from "express";   
import { auth, adminOnly } from "../auth.js"
import Deal from "../models/deal.js"
import { createDeal } from "../controllers/deal_controller.js"

const router = Router()
router.use(auth)

// Get all User's Deals
router.get('/user-deals', auth, async (req, res) => {
    try {
        const userId = req.auth.id

        const deals = await Deal.find({userId})
        if (!deals || deals.length == 0) {
            return res.status(404).send({message: "Deals not found for this user"})
        }

        return res.send(deals)
    } catch (err) {
        return res.status(400).send({ error: err.message})
    }
})

// Get all deals (Admin only)
router.get('/deals', auth, adminOnly, async (req, res) => {
    try {
        const deals = await Deal
            // Draft query string returns all deals, otherwise only incomplete deals are shown
            // .find(req.query.draft ? {} : { isComplete: false })
            .find()
            // Populates info from loan_request and user models
            .populate([{
                path: 'loanDetails',
                select: '-__v -_id -expiry_date'
            },
            {
                path: 'lenderId',
                select: '-__v -_id -password -isAdmin -createdAt -updatedAt'
            }])
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
    const deal = await Deal
        .findById(dealId)
        // Populates info from loan_request and user models
        .populate([{
            path: 'loanDetails',
            select: '-__v -_id -expiry_date'
        },
        {
            path: 'lenderId',
            select: '-__v -_id -password -isAdmin -createdAt -updatedAt'
        }])
    // Send the deal back to the client
    if (deal) {
        res.send(deal)
    } else {
        res.status(404).send({error: `Deal with id ${dealId} not found.`})
    }
})

// Create deal (authorised user only)
// createDeal function imported from deal_controller.js
router.post('/deals', auth, createDeal)

// Update deal (admin only)
async function update(req, res) {
    try {
        // Find deal by id
        const deal = await Deal.findById(req.params.id)
        // Return error if id does not exist
        if (!deal) {
            return res.status(404).send({ error: `Deal with id ${req.params.id} not found.` })
        }
        // Update deal if id exists
        const updateDeal = await Deal.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
        // Send response to client
        res.status(200).send(updateDeal)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

router.put('/deals/:id', auth, adminOnly, update)
router.patch('/deals/:id', auth, adminOnly, update)

// Delete deal (admin only)
router.delete('/deals/:id', auth, adminOnly, async (req, res) => {
    try {
        const dealId = req.params.id
        const deal = await Deal.findByIdAndDelete(dealId)
        if (deal) {
            res.status(200).send({ message: 'Deal deleted successfully.' })
        } else {
            res.status(404).send({ error: `Deal with id ${dealId} not found.` })
        }
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

// ADMIN - Get total number of loans funded (deals complete)
router.get('/admin/deals-complete', auth, adminOnly, async (req, res) => {
    try {
        // Get all deals that are complete
        const deals = await Deal.find({isComplete: true})

        const completeDeals = deals.length;

        res.send({totalCompletedDeals: completeDeals})
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

// ADMIN - Get total number of deals active
router.get('/admin/deals-incomplete', auth, adminOnly, async (req, res) => {
    try {
        // Get all deals that are complete
        const deals = await Deal.find({isComplete: false})

        const activeDeals = deals.length;

        res.send({ActiveDeals: activeDeals})
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})


export default router