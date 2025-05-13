import { Router } from "express";
import { auth } from "../auth.js"; // Import the JWT middleware
import LoanRequest from "../models/loan_request.js";

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
        const { request_amount, interest_term, cryptocurrency} = req.body;

        const loanRequest = await LoanRequest.create({ 
            borrower_id: userId,
            request_amount,
            interest_term,
            cryptocurrency
        });
        
        res.status(201).json({ message: "Loan request created successfully", loanRequest });
        // 3. Validate input fields (e.g., required fields, types, value ranges
        // Optional: manual validation or rely on Mongoose schema validation

        // 4. Check if referenced InterestTerm Exists
        // const interestTerm = await InterestTerm.findById(interest_term_id);

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