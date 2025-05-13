import { Router } from "express";
import LoanRequest from "../models/loan_request.js";
import InterestTerm from "../models/interest_term.js";
import Cryptocurrency from "../models/cryptocurrency.js";
import User from "../models/user.js";
import { auth } from "../middleware/auth.js";

const router = Router();
// Middleware to verify JWT token
router.use(auth());

// Create a new loan request
router.post("/loan_request", async (req, res) => {
    
    try {
        // JWT middleware adds 'req.auth' containing decoded payload
        const userId = req.auth?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: no user ID in token" });
        }
        
        return res.status(200).json({ message: "Loan request created successfully" });



        // 1. Verify token (already handled by router.user(verifyToken))
        // - req.user is populated by the verifyToken middleware

        // 2. Extract loan request details from req.body
        // const { request_amount, interest_term_id, cryptocurrency_id, expiry_date } = req.body;

        // 3. Validate input fields (e.g., required fields, types, value ranges
        // Optional: manual validation or rely on Mongoose schema validation

        // 4. Check if referenced InterestTerm Exists
        // const interestTerm = await InterestTerm.findById(interest_term_id);

    }
    catch (error) {
        console.error("Error creating loan request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
})