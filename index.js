import 'dotenv/config' // Load environment variables from .env file
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { connect } from './db.js'
import user_routes from './routes/user_routes.js'
import loan_request_routes from './routes/loan_request_routes.js'
import deal_routes from './routes/deal_routes.js'
import collateral_routes from './routes/collateral_routes.js'
import wallet_routes from './routes/wallet_routes.js'
import interest_term_routes from './routes/interest_term_routes.js'
import transaction_routes from './routes/transaction_routes.js'
import cryptocurrency_routes from './routes/cryptocurrency_routes.js'

// console.log(process.env) // Check if environment variables are loaded correctly

const app = express()
const port = 8080

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',         // Frontend origin - Production only until we have a url for our front-end
  credentials: true,                       // Allow credentials (e.g. Authorization headers)
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow JWTs in headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json());
app.use(cookieParser())


// Routes
app.use(user_routes)
app.use(loan_request_routes)
app.use(deal_routes)
app.use(collateral_routes)
app.use(wallet_routes)
app.use(interest_term_routes)
app.use(transaction_routes)
app.use(cryptocurrency_routes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(err.status || 500).send({error: err.message});
});

app.listen(port, async () => {
    console.log(`Back-end is listening on port ${port}`)
    connect()
});

// This is a health endpoint that can be pinged freely
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});
