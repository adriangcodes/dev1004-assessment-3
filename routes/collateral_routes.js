import { Router } from 'express';
import { adminOnly, auth } from '../auth.js';
import Collateral from '../models/collateral.js';
import User from '../models/user.js';
import Deal from '../models/deal.js';
import LoanRequest from '../models/loan_request.js';
import Wallet from '../models/wallet.js';

const router = Router();

// Create a new collateral entry
// Trying to post the collateral to the deal when the deal is created
router.post('/collateral', auth, async (req, res) => {
    try {
        // Get the deal ID from the request body
        const { deal_id } = req.body

        const deal = await Deal.findById(deal_id).populate('loanDetails');
        if (!deal) {
            return res.status(404).send({ error: 'Deal not found' });
        }

        const loan = deal.loanDetails; // Get the loan details from the deal
        const borrowerId = loan.borrower_id; // Get the borrower ID from the loan
        const amount = loan.request_amount; // Get the loan amount from the loan

        // Check if the authenticated user is the borrower of the loan
        if (borrowerId.toString() !== req.auth.id) {
            return res.status(403).send({ error: 'You are not the borrower for this deal' });
        }

        // Check if the borrower has enough funds to cover the collateral
        const wallet = await Wallet.findOne({ userId: borrowerId})
        const walletBalance = wallet.balance
        if (walletBalance < amount) {
            return res.status(400).send({error: `Insufficient balance`})
        }

        // Deduct collateral from wallet
        wallet.balance -= amount
        await wallet.save()
        
        // Create collateral record
        const collateral = new Collateral({
            deal_id,
            amount
        })
        await collateral.save();

        
        res.status(201).send({ message: 'Collateral posted successfully', collateral});
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
})


// Get all user's collateral
router.get('/collateral', auth, async (req, res) => {
    try {
        // Get the user ID from the JWT token
        const userId = req.auth.id
        
        const userCollateral = await Collateral.find()
            .populate({
                path: 'deal_id',
                populate: {
                    path: 'loanDetails',
                    model: 'LoanRequest',
                    select: 'borrower_id request_amount',
                    populate: {
                        path: 'borrower_id',
                        model: 'User',
                        select: '_id walletId',
                    }    
                }
            })
        
        // Filter only collateral where the borrower_id matched the authenticated user
        const filtered = userCollateral.filter(collateral =>
            collateral.deal_id?.loanDetails?.borrower_id?._id.toString() === userId
        );

        res.send(filtered)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

// Get a User's Posted Collateral by ID
router.get('/collateral/:id', auth, async (req, res) => {
    try {
        // Get users ID from req.auth.id
        const { id } = req.params;
        const collateral = await Collateral.findById(id).populate({
            path: 'deal_id',
            populate: {
                path: 'loanDetails',
                model: 'LoanRequest',
                populate: {
                    path: 'borrower_id',
                    model: 'User'
                }
            }
        });

        if (!collateral) {
            res.status(404).send({error: "No collateral found with that ID"})
        } 

        // Restrict access to the borrower only
        if (collateral.deal_id.loanDetails.borrower_id._id.toString() !== req.auth.id) {
            return res.status(403).send({error: "Unauthorised access to this collateral"})
        }

        res.send(collateral)
        
    } catch (err) {
        res.status(400).send({ error: err.message})
    }
})


// ADMIN Route for getting all collateral
router.get('/admin/collateral', auth, adminOnly, async (req, res) => {
    try {
        const collateral = await Collateral.find()
            .select('-__v')
            .populate({
                path: 'deal_id',
                select: 'lenderId loanDetails isComplete createdAt',
                populate: {
                    path: 'loanDetails',
                    model: 'LoanRequest',
                    select: 'request_amount borrower_id',
                    populate: {
                        path: 'borrower_id',
                        model: 'User',
                        select: 'walletId'
                    }
                }
            })

        res.send(collateral)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

// ADMIN Get total amount of collateral held
router.get('/admin/collateral/total', auth, adminOnly, async (req, res) => {
    try {
        // Get all collaterals where status === 'locked'
        const collaterals = await Collateral.find({status: "locked"})

        if (!collaterals || collaterals.length === 0) {
            res.send({TotalValueCollateralHeld: 0})
        }
        
        let totalCollateral = 0;
        for (let c of collaterals) {
            totalCollateral += c.amount
        }

        res.send({TotalValueCollateralHeld: totalCollateral})

    } catch (err) {
        res.status(400).send({ error: err.message})
    }
})

// ADMIN Route Get collateral by ID
router.get('/admin/collateral/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params
          const collateral = await Collateral.findById(id)
            .select('-__v')
            .populate({
                path: 'deal_id',
                select: '-__v',
                populate: {
                    path: 'loanDetails',
                    model: 'LoanRequest',
                    select: 'request_amount borrower_id',
                    populate: {
                        path: 'borrower_id',
                        model: 'User',
                        select: 'walletId email'
                    }
                }
            });
        
        if (!collateral) {
            return res.status(404).send({ error: 'Collateral not found' });
        }

        res.send(collateral)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
});



//ADMIN Routes and function for updating collateral status
async function update(req, res) {
    try {
        // Find collateral by id
        const collateral = await Collateral.findById(req.params.id)
        if (!collateral) {
            return res.status(404).send({ error: `Collateral with id ${collateral} not found`})
        }

        const updatedCollateral = await Collateral.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })

        res.send(updatedCollateral)

    } catch (err) {
        res.status(400).send({ error: err.message})
    }
};
router.put('/admin/collateral/:id', auth, adminOnly, update);
router.patch('/admin/collateral/:id', auth, adminOnly, update);



// ADMIN Route - Release or Refund Collateral after deal completion
router.post('/admin/collateral/:id/release', auth, adminOnly, async (req, res) => {
    try {
        // Find collateral with id in req.params.id
        const collateralId = req.params.id
        const collateral = await Collateral.findById(collateralId)

        // If doesn't exist, let user know that the collateral doesn't exist
        if (!collateral) {
            res.status(404).send({ error: `Collateral with id ${collateral} not found`})
        }

        // Check to see if collateral has already been released or forfeited,
        // if it has, let the user know
        if (collateral.status === "released" || collateral.status === "forfeited") {
            res.status(409).send({ error: `Collateral has already been ${collateral.status}.`})
        }
        
        // Get the collateral amount in the collateral save to a variable
        const collateralAmount = collateral.amount

        // Find related Deal
        const deal = await Deal.findById(collateral.deal_id)
        if (!deal) {
            res.status(404).send({error: "Deal not found for the collateral"})
        }

        // Find related LoanRequest
        const loanRequest = await LoanRequest.findById(deal.loanDetails);
        if (!loanRequest) {
            res.status(404).send({error: "Loan Request not found for this deal"})
        }

        // Find the borrower (user who created the loan request)
        const borrower = await User.findById(loanRequest.borrower_id)
        if (!borrower) {
            res.status(404).send({error: "Borrower not found to return collateral to"})
        };

        // Credit the collateral amount to the user's wallet
        const wallet = await Wallet.findOne({ userId: borrower._id })
        if (!wallet) {
            res.status(404).send({error: "Wallet not found for the borrower"})
        }

        wallet.balance += collateralAmount
        await wallet.save()

        // Update the collateral and deal
        collateral.status = "released"
        await collateral.save()

        deal.isComplete = true
        await deal.save()

        res.send({
            message: 'Collateral released and credited to borrow successfully',
            borrower: borrower.email,
            walletBalance: wallet.balance,
            dealId: deal._id,
            dealComplete: deal.isComplete,
            collateralStatus: collateral.status
        })

    } catch (err) {
        res.status(400).send({ error: err.message})
    }
});



export default router;