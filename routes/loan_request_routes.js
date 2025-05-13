import { Router } from "express";
import { auth } from "../auth.js"; // Import the JWT middleware
import LoanRequest from "../models/loan_request.js";
import Cryptocurrency from "../models/cryptocurrency.js";
import InterestTerm from "../models/interest_term.js";
import User from "../models/user.js";

const router = Router();

// Create a new loan request
router.post("/loan-request", auth, async (req, res) => {
    
    try {
        
        const userId = req.auth.id; // Get the user ID from the authenticated user 

        // Extract loan request details from req.body
        const { request_amount, loan_term, cryptocurrency_symbol} = req.body;

        const cryptoDoc = await Cryptocurrency.findOne({ symbol: cryptocurrency_symbol})
        if (!cryptoDoc) {
            return res.status(400).json({ error: `Cryptocurrency ${cryptocurrency_symbol} not found`})
        }

        const interestTermDoc = await InterestTerm.findOne({loan_length: loan_term})
        
        if (!interestTermDoc) {
            return res.status(400).json({ error: `Loan term of ${loan_term} months not found. Try 1, 3, or 6 months`})
        }

        // Add new Loan Request to the db
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

// Get all loan requests
router.get('/loan-request', auth, async (req, res) => {
    try {
        // Get all loan requests from the database
        const loanRequests = await LoanRequest
        .find()
        .select('-__v')
        .populate('borrower_id', 'name email') // Populate borrower details
        .populate('interest_term', 'loan_length interest_rate') // Populate interest term details
        .populate('cryptocurrency', 'symbol name') // Populate cryptocurrency details
        res.send(loanRequests);
    } catch (error) {
        console.error("Error fetching loan requests:", error);
        res.status(500).send({ error: "Internal server error" });
    }
})

// Get a specific loan request by ID
router.get('/loan-request/:id', auth, async (req, res) => {
    try {
        // Get the loan request ID from the request parameters
        const loanRequestId = req.params.id;

        // Find the loan request by ID and populate necessary fields
        const loanRequest = await LoanRequest
            .findById(loanRequestId)
            .select('-__v')
            .populate('borrower_id', 'name email') // Populate borrower details
            .populate('interest_term', 'loan_length interest_rate') // Populate interest term details
            .populate('cryptocurrency', 'symbol name'); // Populate cryptocurrency details

        if (!loanRequest) {
            return res.status(404).json({ error: "Loan request not found" });
        }

        res.status(200).json(loanRequest);

    } catch (error) {
        console.error("Error fetching loan request:", error);
        res.status(500).send({ error: "Internal server error" });
    }
})

// Fund a new loan
router.post('/fund-loan', auth, async (req, res) => {
    try {
        const funderId = req.auth.id; // Get the funder ID from the authenticated user
        
        //  Extract loan request details from req.body
        const { loan_request_id, funding_amount } = req.body;

        // Find the loan request by ID
        const loanRequest = await LoanRequest
            .findById(loan_request_id)
            .populate('cryptocurrency', 'symbol');
        if (!loanRequest) {
            return res.status(404).json({ error: "Loan request not found" });

        } else if (loanRequest.status !== 'active') {
            return res.status(400).json({ error: "Loan request is not active" });
        }

        // Get funder user
        const funder = await User.findById(funderId);
        if (!funder) {
            return res.status(404).json({ error: "Funder not found" });
        }

        const cryptoSymbol = loanRequest.cryptocurrency.symbol;
        console.log(cryptoSymbol);

        console.log('Funder wallet:', funder.wallet);
        console.log('cryptoSymbol:', cryptoSymbol);
        console.log('Current balance:', funder.wallet?.[cryptoSymbol]);
        console.log('Funding amount:', funding_amount);



        // TODO: Add funder.wallet as a field in the User model
        const currentBalance = funder.wallet?.get(cryptoSymbol) ?? 0;

        if (currentBalance < funding_amount) {
            return res.status(400).json({ error: `Insufficient balance in ${cryptoSymbol} wallet` });
        }

        // Deduct the funding amount from the funder's wallet
        funder.wallet.set(cryptoSymbol, currentBalance - funding_amount);
        await funder.save();

        // Update the loan request with the funding amount
        loanRequest.funding_amount = funding_amount;
        loanRequest.status = "funded";
        await loanRequest.save();

        res.status(200).json({ message: "Loan request funded successfully", loanRequest });
    }
    catch (error) {
        console.error("Error funding loan request:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
})




export default router;