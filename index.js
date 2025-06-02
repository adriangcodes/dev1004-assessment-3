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
import health_routes from './routes/health_routes.js'

const app = express()
const port = 8080

// Middleware
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}))

app.use(cors({
  origin: [
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],  
  credentials: true,                       // Allow credentials (e.g. Authorization headers)
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow JWTs in headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


// Routes
app.use(health_routes)
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
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  return res.status(status).json({ error: message });
})

app.listen(port, async () => {
  console.log(`Back-end is listening on port ${port}`)
  connect()
})