# P2P Crypto Lending Backend

A secure and efficient backend system for peer-to-peer cryptocurrency lending, built with Node.js and Express. Developed as part of Coder Academy's Web Development Unit (DEV1003) - Assessment 2.

## Overview

This project is a backend web service that powers a peer-to-peer cryptocurrency lending platform. It enables users to securely lend and borrow crypto assets, manage collateral, and track deals and transactions. The app simulates core lending workflows and adheres to industry-standard practices for authentication, data validation, and route protection.

### Features
- User registration and login with JWT authentication
- Wallet creation and management
- Submit and browse loan requests
- Accept and manage loan deals
- Upload and validate crypto collateral
- Track and manage transactions
- Admin-specific access controls

## Current Limitations

While the system provides a complete flow from user registration through deal acceptance and transaction generation, please note the following limitations:

- Loan repayment functionality is not implemented in the current version
- The system is currently configured for development/testing environments
- Frontend integration is limited to localhost:5173
- Real cryptocurrency transactions are not implemented (simulated for demonstration)

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (hosted on MongoDB Atlas)
- Authentication: JWT (JSON Web Token)
- Security: Helmet, CORS, Cookie-Parser
- Environment Management: dotenv
- Testing: Jest, Supertest

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SatoshiFundAus/dev1003-p2p-crypto-lending-backend
cd dev1003-p2p-crypto-lending-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8080
```

4. Start the server:
```bash
npm start
```

The server will start on port 8080 by default.

## API Endpoints

### User Management
- POST /users/register
  - Register a new user
  - Body: `{ email, password, firstName, lastName }`
  - Returns: User object with JWT token

- POST /users/login
  - Authenticate user
  - Body: `{ email, password }`
  - Returns: User object with JWT token

- GET /users/profile
  - Get authenticated user's profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: User profile object

### Loan Requests
- POST /loan-requests
  - Create a new loan request
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ amount, currency, term, interestRate, collateralType }`
  - Returns: Created loan request object

- GET /loan-requests
  - List all loan requests
  - Headers: `Authorization: Bearer <token>`
  - Query params: `status`, `currency`, `minAmount`, `maxAmount`
  - Returns: Array of loan request objects

- GET /loan-requests/:id
  - Get specific loan request details
  - Headers: `Authorization: Bearer <token>`
  - Returns: Loan request object with full details

### Deals
- POST /deals
  - Create a new lending deal
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ loanRequestId, lenderId, terms }`
  - Returns: Created deal object

- GET /deals
  - List all deals
  - Headers: `Authorization: Bearer <token>`
  - Query params: `status`, `userId`
  - Returns: Array of deal objects

- GET /deals/:id
  - Get specific deal details
  - Headers: `Authorization: Bearer <token>`
  - Returns: Deal object with full details

### Collateral
- POST /collateral
  - Add cryptocurrency collateral
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ dealId, amount, cryptocurrency }`
  - Returns: Created collateral object

- GET /collateral
  - List all collateral
  - Headers: `Authorization: Bearer <token>`
  - Query params: `dealId`, `status`
  - Returns: Array of collateral objects

- GET /collateral/:id
  - Get specific collateral details
  - Headers: `Authorization: Bearer <token>`
  - Returns: Collateral object with full details

### Transactions
- POST /transactions
  - Create a new transaction
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ dealId, type, amount, cryptocurrency }`
  - Returns: Created transaction object

- GET /transactions
  - List all transactions
  - Headers: `Authorization: Bearer <token>`
  - Query params: `dealId`, `type`, `status`
  - Returns: Array of transaction objects

- GET /transactions/:id
  - Get specific transaction details
  - Headers: `Authorization: Bearer <token>`
  - Returns: Transaction object with full details

### Error Responses
All endpoints may return the following error responses:
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error

## Security Features

- JWT-based authentication
- Helmet security headers
- CORS protection
- Input validation
- Secure password hashing via bcrypt
- Protected routes via user authorisation

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows ESLint configuration for consistent code style.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Team

This project was developed as a collaborative effort by:

### Tyson Williams
- [GitHub Profile](https://github.com/TysonPWilliams)
- [LinkedIn](https://www.linkedin.com/in/tyson-williams-13273760)

### Adrian Gidaro
- [GitHub Profile](https://github.com/adriangcodes)
- [LinkedIn](https://www.linkedin.com/in/adriangidaro)

## License

This project is licensed under the MIT License - see the LICENSE file for details.