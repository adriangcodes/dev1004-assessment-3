import { Router } from "express";
import { auth } from "../auth.js"; // Import the JWT middleware
import LoanRequest from "../models/loan_request.js";
import Cryptocurrency from "../models/cryptocurrency.js";
import InterestTerm from "../models/interest_term.js";

const router = Router();

// Create a new loan request
router.post("/loan-request", auth, async (req, res) => {
    
    try {
        // 1. Check if the user is authenticated
        // JWT middleware adds 'req.auth' containing decoded payload
        const userId = req.auth?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: no user ID in token" });
        }


        // 2. Extract loan request details from req.body
        const { request_amount, loan_term, cryptocurrency_symbol} = req.body;

        const cryptoDoc = await Cryptocurrency.findOne({ symbol: cryptocurrency_symbol})
        if (!cryptoDoc) {
            return res.status(400).json({ error: `Cryptocurrency ${cryptocurrency_symbol} not found`})
        }

        const interestTermDoc = await InterestTerm.findOne({loan_length: loan_term})
        
        if (!interestTermDoc) {
            return res.status(400).json({ error: `Loan term of ${loan_term} months not found. Try 1, 3, or 6 months`})
        }

        const loanRequest = await LoanRequest.create({ 
            borrower_id: userId,
            request_amount,
            interest_term: interestTermDoc._id,
            cryptocurrency: cryptoDoc._id,
        });
        
        res.status(201).json({ message: "Loan request created successfully", loanRequest });
    
    }
    catch (error) {
    console.error("Error creating loan request:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
}

})

export default router;