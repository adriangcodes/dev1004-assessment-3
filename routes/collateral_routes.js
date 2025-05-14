import { Router } from 'express';
import { adminOnly, auth } from '../auth.js';
import Collateral from '../models/collateral.js';
import User from '../models/user.js';
import LoanRequest from '../models/loan_request.js';
import Deal from '../models/deal.js';

const router = Router();

// Create a new collateral
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
        const borrower = await User.findById(borrowerId);
        const cryptoSymbol = "BTC"
        const walletBalance = borrower.wallet?.get(cryptoSymbol) ?? 0;
        
        if (walletBalance < amount) {
            return res.status(400).send({ error: `Insufficient balance in ${cryptoSymbol} wallet` });
        }

        // Deduct collateral from wallet
        borrower.wallet.set(cryptoSymbol, walletBalance - amount);
        await borrower.save();
        
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

// ADMIN Route for getting all collateral
router.get('/admin-collateral', auth, adminOnly, async (req, res) => {
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

export default router;