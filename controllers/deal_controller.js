import Deal from '../models/deal.js'
import Transaction from '../models/transaction.js'
import User from '../models/user.js'
import LoanRequest from '../models/loan_request.js'
import Collateral from '../models/collateral.js'
import Wallet from '../models/wallet.js'

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

    // Validate lender has enough balance in their wallet to fund the loan
    const cryptoId = loanRequestExists.cryptocurrency;
    const cryptoAmount = loanRequestExists.request_amount;
    const borrowerId = loanRequestExists.borrower_id;

    const lenderWallet = await Wallet.findOne({ user: bodyData.lenderId, cryptocurrency: cryptoId });
    if (!lenderWallet || lenderWallet.balance < cryptoAmount) {
      return res.status(400).json({ error: 'Lender does not have sufficient funds to fund this loan.' });
    }

    // Check borrower has collateral equivalent to the requested amount
    const collateralWallet = await Wallet.findOne({ userId: borrowerId, cryptoType: cryptoId });
    if (!collateralWallet || collateralWallet.balance < cryptoAmount) {
      return res.status(400).json({ error: 'Borrower does not have sufficient collateral.' });
    }

    // Deduct collateral from borrower's wallet
    collateralWallet.balance -= cryptoAmount;
    await collateralWallet.save();

    // Deduct amount from lender's wallet
    lenderWallet.balance -= cryptoAmount;
    await lenderWallet.save();

    // Credit amount to borrower's wallet
    const borrowerWallet = await Wallet.findOneAndUpdate(
      { user: borrowerId, cryptocurrency: cryptoId },
      { $inc: { balance: cryptoAmount } },
      { new: true, upsert: true }
    );

    // Create a new Deal instance
    const deal = await Deal.create(bodyData)

    // Create a new Collateral instance
    const collateral = await Collateral.create({
      deal_id: deal._id,
      amount: cryptoAmount
    })

    // Triggers automatic payment schedule within Transaction
    await Transaction.generateRepaymentSchedule(deal._id)

    // Update loan request status to 'funded'
    loanRequestExists.status = 'funded'
    await loanRequestExists.save()

    // Send response to client
    res.status(201).json({ message: "Loan request funded, deal successfully created.", deal });

  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}