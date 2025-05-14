import { Router } from 'express';
import { auth } from '../auth.js';
import Collateral from '../models/collateral.js';
import Deal from '../models/deal.js';

const router = Router();

// Create a new collateral
router.post('/collateral', auth, async (req, res) => {
    // Get the deal ID from the request body
    // Check if the deal exists
    // Find out what amount of collateral needs to be held from the deal
    // check if the user has enough funds to cover the collateral
    // Create a new Collateral instance
    // Send the collateral back to the client
})