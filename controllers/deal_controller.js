import Deal from '../models/deal.js'
import Transaction from '../models/transaction.js'
import User from '../models/user.js'
import LoanRequest from '../models/loan_request.js'

export async function createDeal(req, res) {
  try {
    // Get post data from request body
    const bodyData = req.body
    // Validate lender
    const lenderExists = await User.findById(bodyData.lenderId)
    if (!lenderExists) {
      return res.status(400).json({ error: 'Lender user not found.' })
    }
    // Validate loan request
    const loanRequestExists = await LoanRequest.findById(bodyData.loanDetails)
    if (!loanRequestExists) {
      return res.status(400).json({ error: 'Loan request not found.' })
    }
    // Create a new Deal instance
    const deal = await Deal.create(bodyData)
    // Triggers automatic payment schedule within Transaction
    await Transaction.generateRepaymentSchedule(deal._id)
    // Send response to client
    res.status(201).json(deal)
  } catch (err) {
    // console.error('Error creating deal:', err)
    res.status(500).send({ error: err.message })
  }
}