import { Router } from "express";
import LoanRequest from "../models/loan_request.js";
import InterestTerm from "../models/interest_term.js";
import Cryptocurrency from "../models/cryptocurrency.js";
import User from "../models/user.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();
// Middleware to verify JWT token
router.use(verifyToken);

// Create a new loan request
router.post("/loan_request", async (req, res) => {
    
    
    try {
        // Get post data from the request body
        const bodyData = req.body;

    
    }
    catch {
        // TODO: Catch specific errors and send appropriate messages
        return
    }

})