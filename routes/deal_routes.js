import { Router } from "express"
import { auth, adminOnly } from "../auth.js"
import Deal from "../models/deal.js"
import User from "../models/user.js"
import LoanRequest from "../models/loan_request.js"
import Wallet from "../models/wallet.js"
import Collateral from "../models/collateral.js"
import Transaction from "../models/transaction.js"

const router = Router()

// Helper function
function formatBalance(amount) {
    // Round to 8 decimal places and remove trailing zeros
    return parseFloat(parseFloat(amount).toFixed(8));
}

// Get all deals where the user is the lender
router.get('/lender-deals', auth, async (req, res) => {
    try {
        const userId = req.auth.id

        const deals = await Deal.find({ lenderId: userId })
            .populate({
                path: 'loanDetails',
                select: 'request_amount borrower_id interest_term status'
            })
            .populate({
                path: 'lenderId',
                select: 'email'
            })

        if (!deals || deals.length === 0) {
            return res.status(404).json({ message: "No deals found where you are the lender." })
        }

        return res.status(200).json(deals)
    } catch (error) {
        console.error('Error fetching lender deals:', error)
        return res.status(500).json({ error: 'Failed to fetch lender deals.' })
    }
})

// Get all deals where the user is the borrower
router.get('/borrower-deals', auth, async (req, res) => {
    try {
        const userId = req.auth.id

        const deals = await Deal.find()
            .populate({
                path: 'loanDetails',
                match: { borrower_id: userId },
                select: 'request_amount borrower_id interest_term status cryptocurrency',
                populate: [
                    {
                        path: 'interest_term',
                        select: 'loan_length interest_rate'
                    },
                    {
                        path: 'cryptocurrency',
                        select: 'symbol name'
                    }
                ]
            })
            .populate({
                path: 'lenderId',
                select: 'email'
            })

        // Filter out deals where loanDetails is null (due to the match condition)
        const filteredDeals = deals.filter(deal => deal.loanDetails !== null)

        if (!filteredDeals || filteredDeals.length === 0) {
            return res.status(404).json({ message: "No deals found where you are the borrower." });
        }

        return res.status(200).json(filteredDeals);
    } catch (error) {
        console.error('Error fetching borrower deals:', error)
        return res.status(500).json({ error: 'Failed to fetch borrower deals.' })
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
    } catch (err) {
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
        res.status(404).send({ error: `Deal with id ${dealId} not found.` })
    }
})


// Helper functions
// Validate user
async function validateUserById(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('Lender user not found.');
    return user;
}

// Validate loan request
async function validateLoanRequestById(loanId) {
    const loan = await LoanRequest.findById(loanId);
    if (!loan) throw new Error('Loan request not found.');
    return loan;
}
// Validate wallet
async function getAndValidateWallet(userId, cryptoId, requiredAmount, label) {
    // Try both userId and user field for compatibility
    let wallet = await Wallet.findOne({ userId, cryptoType: cryptoId });
    if (!wallet) {
        wallet = await Wallet.findOne({ user: userId, cryptocurrency: cryptoId });
    }
    if (!wallet || wallet.balance < requiredAmount) {
        throw new Error(`${label} does not have sufficient funds.`);
    }
    return wallet;
}

// Create deal (authorised user only)
router.post('/deals', auth, async (req, res) => {
    try {
        // Fetch data from json
        const bodyData = req.body
        // User validation function
        await validateUserById(bodyData.lenderId)
        const loan = await validateLoanRequestById(bodyData.loanDetails)

        const cryptoId = loan.cryptocurrency
        const cryptoAmount = loan.request_amount
        const borrowerId = loan.borrower_id

        // Wallet validation function
        const lenderWallet = await getAndValidateWallet(bodyData.lenderId, cryptoId, cryptoAmount, 'Lender')
        const borrowerCollateralWallet = await getAndValidateWallet(borrowerId, cryptoId, cryptoAmount, 'Borrower')

        // Transfer loan balance out of lender wallet
        lenderWallet.balance = formatBalance(lenderWallet.balance - cryptoAmount)
        await lenderWallet.save()

        // Transfer collateral amount out of borrower wallet
        borrowerCollateralWallet.balance = formatBalance(borrowerCollateralWallet.balance - cryptoAmount)
        await borrowerCollateralWallet.save()

        // Update wallet
        await Wallet.findOneAndUpdate(
            { userId: borrowerId, cryptoType: cryptoId },
            { $inc: { balance: cryptoAmount } }
        )

        // Create deal instance
        const deal = await Deal.create(bodyData);

        // Create collateral instance
        await Collateral.create({
            deal_id: deal._id,
            amount: cryptoAmount
        })

        // Trigger transaction repayment schedule
        await Transaction.generateRepaymentSchedule(deal._id)

        // Update loan request status to funded
        loan.status = 'funded';
        await loan.save();

        // Return response to client
        res.status(201).json({
            message: "Loan request funded, deal successfully created and funds transferred.",
            deal
        })
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

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
        const deals = await Deal.find({ isComplete: true })

        const completeDeals = deals.length;

        res.send({ totalCompletedDeals: completeDeals })
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

// ADMIN - Get all information of active deals
router.get('/admin/deals-active', auth, adminOnly, async (req, res) => {
    try {
        // Get all deals that are active
        const deals = await Deal.find({ isComplete: false })
            .populate({
                path: 'loanDetails',
                select: 'request_amount borrower_id', // request_amount is the loan amount
                populate: {
                    path: 'borrower_id',
                    select: 'email'
                }
            })
            .populate({
                path: 'lenderId',
                select: 'email'
            })

        const activeDealsInfo = deals.map(deal => ({
            dealId: deal._id,
            borrowerEmail: deal.loanDetails?.borrower_id?.email,
            lenderEmail: deal.lenderId?.email,
            amount: deal.loanDetails?.request_amount,
            expectedCompletionDate: deal.expectedCompletionDate,
            dealStatus: deal.isComplete ? 'Complete' : 'Active'
        }))

        res.send(activeDealsInfo)

    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

// ADMIN - Get total number of deals active
router.get('/admin/deals-incomplete', auth, adminOnly, async (req, res) => {
    try {
        // Get all deals that are complete
        const deals = await Deal.find({ isComplete: false })

        const activeDeals = deals.length;

        res.send({ ActiveDeals: activeDeals })
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})


export default router