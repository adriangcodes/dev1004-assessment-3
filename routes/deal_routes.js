import { Router } from "express";   
import { auth, adminOnly } from "../auth.js";
import Deal from "./models/deals.js"

const router = Router()
router.use(auth)

// Get one deal (authorised user only)
router.get('/deals', auth, async (req, res) => {
    // Get the id of the deal
    const deal_id = req.params.deal_id
    // Get the deal with the given id
    const deal = await Deal.find({ _id: deal_id })
    // Send the deal back to the client
    if (deal) {
        res.send(deal)
    } else {
        res.status(404).send({error: `Deal with id ${deal_id} not found.`})
    }
})

// Get all deals (authorised user only)

// Create deal (authorised user only)

// Update deal (authorised user only)

// Delete deal (admin only)

export default router