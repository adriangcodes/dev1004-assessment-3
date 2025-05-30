import { Router } from "express";
import { auth, adminOnly } from "../auth.js"; // Import the JWT middleware
import LoanRequest from "../models/loan_request.js";
import Cryptocurrency from "../models/cryptocurrency.js";
import InterestTerm from "../models/interest_term.js";
import Wallet from "../models/wallet.js"

const router = Router();


// Create a new loan request (authorised user only)
router.post("/loan-requests", auth, async (req, res) => {
    try {
        // Get the user ID from the authenticated user 
        const userId = req.auth.id;
        // Extract loan request details from req.body
        const { request_amount, loan_term, cryptocurrency_symbol} = req.body;
        // Validate cryptocurrency
        const cryptoDoc = await Cryptocurrency.findOne({ symbol: cryptocurrency_symbol})
        if (!cryptoDoc) {
            return res.status(400).json({ error: `Cryptocurrency ${cryptocurrency_symbol} not found`})
        }
        // Validate interest term
        const interestTermDoc = await InterestTerm.findOne({loan_length: loan_term})
        if (!interestTermDoc) {
            return res.status(400).json({ error: `Loan term of ${loan_term} months not found. Try 1, 3, or 6 months`})
        }
        // Fetch user's wallet for the given cryptocurrency
        const wallet = await Wallet.findOne({ userId: userId, cryptoType: cryptoDoc._id });
        if (!wallet) {
            return res.status(400).json({ error: `User does not have a wallet for ${cryptocurrency_symbol}.` });
        }
        // Ensure wallet balance covers the requested amount
        if (wallet.balance < request_amount) {
            return res.status(400).json({ error: `Insufficient funds in wallet. You must have at least ${request_amount} ${cryptocurrency_symbol} to request this loan.` });
        }
        // Add new Loan Request to the db
        const loanRequest = await LoanRequest.create({ 
            borrower_id: userId,
            request_amount,
            interest_term: interestTermDoc._id,
            cryptocurrency: cryptoDoc._id,
        })
        // Return success message to client
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

// Get all loan requests (authorised user only)
router.get('/loan-requests', auth, async (req, res) => {
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

// Get a specific loan request by ID (authorised user only)
router.get('/loan-requests/:id', auth, async (req, res) => {
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
        // Force error if loan request is not found
        if (!loanRequest) {
            return res.status(404).json({ error: "Loan request not found" });
        }
        // Return response to client
        res.status(200).json(loanRequest);
    } catch (error) {
        console.error("Error fetching loan request:", error);
        res.status(500).send({ error: "Internal server error" });
    }
})

// Update loan request (admin only)
async function update(req, res) {
    try {
        const loanRequestId = req.params.id
        // Find crypto by id
        const loanRequest = await LoanRequest.findById(loanRequestId)
        // Return error if id does not exist
        if (!loanRequest) {
            return res.status(404).send({ error: `Loan request with id ${loanRequestId} not found.` })
        }
        // Perform the update
        const updatedLoanRequest = await LoanRequest.findByIdAndUpdate(loanRequestId, req.body, { returnDocument: 'after' })
        // Send response to client
        res.status(200).send(updatedLoanRequest)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

router.put('/loan-requests/:id', auth, adminOnly, update)
router.patch('/loan-requests/:id', auth, adminOnly, update)

// Delete loan request (admin only)
router.delete('/loan-requests/:id', auth, adminOnly, async (req, res) => {
    try {
        const loanRequestId = req.params.id
        const loanRequest = await LoanRequest.findByIdAndDelete(loanRequestId)
        if (loanRequest) {
            res.status(200).send({ message: 'Loan request deleted successfully.' })
        } else {
            res.status(404).send({ error: `Loan request with id ${loanRequestId} not found.` })
        }
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})


export default router;