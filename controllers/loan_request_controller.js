// Fund a new loan (authorised user only)
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