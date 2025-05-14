import { Router } from 'express';
import { auth } from '../auth.js';
import Collateral from '../models/collateral.js';
import Deal from '../models/deal.js';

const router = Router();

// Create a new collateral
router.post('/collateral', auth, async (req, res) => {
    try {
        // Get the deal ID from the request body
        const dealId = await Deal.findById(req.params.id)
        // Check if the deal exists
        if (!dealId) {
            return res.status(404).send({ error: 'Deal not found' });
        }
        
        console.log(dealId)
        // Find out what amount of collateral needs to be held from the deal
        // check if the user has enough funds to cover the collateral
        // Create a new Collateral instance
        // Send the collateral back to the client
        res.send({ message: 'Collateral created successfully' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
})

export default router;