# P2P Crypto Lending Backend
A secure and efficient backend system for peer-to-peer cryptocurrency lending, built with Node.js and Express.

## Overview
SatoshiFund is a back-end API built for a peer-to-peer cryptocurrency lending platform. It enables users to securely lend and borrow crypto assets, manage collateral, and track deals and transactions. The app simulates core lending workflows and adheres to industry-standard practices for authentication, data validation, and route protection.

Developed with Node.js, Express, and MongoDB, the app prioritizes modular architecture, secure authentication (via JWT), and robust error handling. Mongoose provides schema validation and clean data modeling. The platform uses RESTful principles to deliver predictable endpoints and supports role-based access control to protect sensitive operations.

Built as part of a collaborative full-stack project, SatoshiFund showcases scalable backend design and practical implementation of modern web development best practices.

### Live Backend:  
The backend is currently live and available at:  
[https://dev1003-p2p-crypto-lending-backend.onrender.com](https://dev1003-p2p-crypto-lending-backend.onrender.com)  
All API routes can be tested from this base URL.


### Features
- User registration and login with JWT authentication
- Wallet creation and management
- Submit and browse loan requests
- Accept and manage loan deals
- Upload and validate crypto collateral
- Track and manage transactions
- Admin-specific access controls

### Current Limitations
While the system provides a complete flow from user registration through deal acceptance and transaction generation, please note the following limitations:

- Loan repayment functionality is not implemented in the current version
- Real cryptocurrency transactions are not implemented (simulated for demonstration)

### Future Plans
- Implementation of loan repayment functionality
- Addition of user hot wallet functionality and real cryptocurrency transaction support, starting with Bitcoin
- Enhanced security features, appropriate to a web3 decentralised finance platform
- Comprehensive logging
- Implementation of rate limiting

### Github
This project can be found on [GitHub at the SatoshiFund organisation repo](https://github.com/orgs/SatoshiFundAus/repositories).

### Frontend Integration

This backend is designed to integrate with the React-based frontend, also found above. API requests are secured with JWT-based Authorization headers. CORS is configured to allow requests from the frontend origin.

## Tech Stack

### Core Dependencies

**Express.js (v5.1.0):**  
Provides the foundation for our RESTful API. Chosen for its lightweight structure, speed, and rich middleware ecosystem, Express allows us to efficiently route requests and handle middleware in a modular way.

**MongoDB (v6.16.0):**  
Our NoSQL database used to store application data in a flexible, document-based format.

**Mongoose (v8.15.0):**  
An ODM (Object Data Modeling) tool for MongoDB that allows us to define schemas, validate data, and hook into document lifecycle events.

**bcrypt (v5.1.1):**  
Used for hashing and salting passwords securely according to modern cryptographic standards.

**jsonwebtoken (v9.0.2):**  
Implements stateless authentication using signed JWT tokens for secure client-server communication.

**cors (v2.8.5):**  
Enables secure cross-origin requests from the client to the API server.

**helmet (v8.1.0):**  
Improves security by setting various HTTP headers to protect against common vulnerabilities.

**dotenv (v16.5.0):**  
Loads environment variables from a `.env` file into `process.env`, allowing secure configuration.

**cookie-parser (v1.4.7):**  
Parses cookies attached to client requests, useful for managing sessions and tokens.

**express-jwt (v8.5.1):**  
Validates JWTs in requests and automatically sets `req.user` for authenticated routes.

### Development Dependencies

**Jest (v29.7.0):**  
Testing framework for writing unit and integration tests.

**Supertest (v7.1.1):**  
Used with Jest to test HTTP endpoints by simulating requests.

**mongodb-memory-server (v10.1.4):**  
Spins up a temporary in-memory MongoDB server for isolated test environments.

## Hardware Requirements

This project is lightweight and designed to run efficiently on modest hardware. Below are the recommended minimum specifications for different environments:

### Local Development
- **CPU:** Dual-core processor
- **RAM:** 4 GB
- **Storage:** minimum 500 MB free space for codebase and MongoDB data
- **OS:** macOS, Linux, or Windows

### Development/Test Server
- **vCPU:** 1 shared or dedicated vCPU
- **RAM:** 512 MB – 1 GB
- **Disk:** 1 GB persistent storage (for MongoDB if self-hosted)
- **Node.js Runtime:** v18 or later

### Production Hosting (Small-Scale)
- **vCPU:** 1–2 vCPUs
- **RAM:** 1–2 GB
- **Disk:** 2+ GB (scales with MongoDB usage)
- **MongoDB Hosting:** Atlas (free or shared-tier is sufficient for demo/small use)

This project does not currently handle production-grade transaction throughput or real-world crypto operations. Additional compute and secure infrastructure would be required for scaling or financial compliance.

## Code Style

While this project does not currently use an automated linter or formatter like ESLint or Prettier, code consistency has been maintained through team conventions and IDE defaults. Variable naming, indentation, and file structure follow widely accepted JavaScript best practices to ensure readability and maintainability.

### Style Conventions
The following conventions are enforced:

- Use of ES modules (`import/export`) syntax
- 2-space indentation
- Single quotes for strings
- Semicolons at the end of statements
- `camelCase` for variable and function names
- Async/await syntax for asynchronous operations
- Consistent use of trailing commas and spacing

Example:
```javascript
import { Router } from 'express'
import { auth } from '../auth.js'

const router = Router()

router.get('/example', auth, async (req, res) => {
  try {
    // Implementation
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})
```

If this project were to scale, adopting a formal style guide (e.g., ESLint with Airbnb config) would be recommended to enforce uniform code standards and catch potential errors early in development.


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
FRONTEND_URL=your_frontend_url
```

4. Start the server:
```bash
npm start
```

The server will start on port 8080 by default.

## API Endpoints

### Authentication & User Management
- POST /register
  - Register a new user
  - Body: 
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Returns: User object with email

- POST /login
  - Login user
  - Body: 
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Returns: JWT token and user info

### User Management
- GET /admin/users
  - Get all users (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of user objects

- PUT /user
  - Update own profile
  - Headers: `Authorization: Bearer <token>`
  - Body: User fields to update
  - Returns: Updated user object

- PUT /users/:id
  - Update any user (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: User fields to update
  - Returns: Updated user object

- DELETE /users/:id
  - Delete user (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Loan Requests
- POST /loan-requests
  - Create a new loan request
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "request_amount": number,
      "interest_term": string (ObjectId),
      "cryptocurrency": string (ObjectId)
    }
    ```
  - Returns: Created loan request object

- GET /loan-requests
  - List all loan requests
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of loan request objects

- GET /loan-requests/:id
  - Get specific loan request
  - Headers: `Authorization: Bearer <token>`
  - Returns: Loan request object

- PUT/PATCH /loan-requests/:id
  - Update loan request (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: Loan request fields to update
  - Returns: Updated loan request object

- DELETE /loan-requests/:id
  - Delete loan request (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Deals
- POST /deals
  - Create a new lending deal
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "lenderId": string (ObjectId),
      "loanDetails": string (ObjectId)
    }
    ```
  - Returns: Created deal object

- GET /lender-deals
  - Get all deals where user is the lender
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of deal objects

- GET /borrower-deals
  - Get all deals where user is the borrower
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of deal objects

- GET /deals/:id
  - Get specific deal
  - Headers: `Authorization: Bearer <token>`
  - Returns: Deal object

- PUT/PATCH /deals/:id
  - Update deal (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: Deal fields to update
  - Returns: Updated deal object

- DELETE /deals/:id
  - Delete deal (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Collateral
- POST /admin/collateral
  - Create new collateral (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "deal_id": string (ObjectId),
      "amount": number,
      "status": string
    }
    ```
  - Returns: Created collateral object

- GET /collateral
  - Get all user's collateral
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of collateral objects

- GET /collateral/:id
  - Get specific collateral
  - Headers: `Authorization: Bearer <token>`
  - Returns: Collateral object

- PUT/PATCH /admin/collateral/:id
  - Update collateral (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: Collateral fields to update
  - Returns: Updated collateral object

### Transactions
- GET /transactions
  - Get all transactions
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of transaction objects

- GET /transactions/:id
  - Get specific transaction
  - Headers: `Authorization: Bearer <token>`
  - Returns: Transaction object

- PUT/PATCH /transactions/:id
  - Update transaction (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: Transaction fields to update
  - Returns: Updated transaction object

- DELETE /transactions/:id
  - Delete transaction (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Interest Terms
- POST /interest-terms
  - Create new interest term
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "interest_rate": number,
      "loan_length": number
    }
    ```
  - Returns: Created interest term object

- GET /interest-terms
  - Get all interest terms
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of interest term objects

- GET /interest-terms/:id
  - Get specific interest term
  - Headers: `Authorization: Bearer <token>`
  - Returns: Interest term object

- PUT/PATCH /interest-terms/:id
  - Update interest term (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: Interest term fields to update
  - Returns: Updated interest term object

- DELETE /interest-terms/:id
  - Delete interest term (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Cryptocurrency
- POST /crypto
  - Create new cryptocurrency
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "name": string,
      "symbol": string
    }
    ```
  - Returns: Created cryptocurrency object

- GET /crypto
  - Get all cryptocurrencies
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of cryptocurrency objects

- GET /crypto/:id
  - Get specific cryptocurrency
  - Headers: `Authorization: Bearer <token>`
  - Returns: Cryptocurrency object

- PUT/PATCH /crypto/:id
  - Update cryptocurrency (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: Cryptocurrency fields to update
  - Returns: Updated cryptocurrency object

- DELETE /crypto/:id
  - Delete cryptocurrency (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Wallets
- POST /wallets
  - Create new wallet
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "cryptocurrency": string (ObjectId)
    }
    ```
  - Returns: Created wallet object

- GET /wallets
  - Get all user's wallets
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of wallet objects

- PUT/PATCH /wallets
  - Update wallet balance
  - Headers: `Authorization: Bearer <token>`
  - Body: Wallet fields to update
  - Returns: Updated wallet object

### Health Check
- GET /health
  - Check API health status
  - Returns: Status object

### Error Responses
All endpoints may return the following error responses:
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Operation cannot be completed (e.g., deleting wallet with balance)
- 500 Internal Server Error: Server-side error

## Security Features

- JWT-based authentication
- Helmet security headers
- CORS protection
- Input validation
- Secure password hashing via bcrypt
- Protected routes via user authorisation

## Development

### Development Server
Start the development server with hot reloading:
```bash
npm run dev
```

### Testing
The project includes comprehensive test coverage for all models using Jest and MongoDB Memory Server. Tests are organized by model.

This project uses Jest as the primary testing framework and MongoDB Memory Server to enable isolated in-memory database testing. Tests are executed in a clean environment with automatic setup and teardown, ensuring database state is reset between runs for consistency and reliability.

To run test files:
```bash
npm test
```

#### User Model (`tests/models/user.test.js`)
- Validates user creation and default values
- Tests email validation (format, length, case sensitivity)
- Tests password validation (length, complexity, required fields)
- Verifies default values for isAdmin and isActive
- Tests email trimming and case conversion

#### Deal Model (`tests/models/deal.test.js`)
- Validates deal creation
- Tests expected completion date calculation
- Verifies relationship with loan requests
- Tests validation of required fields
- Ensures proper handling of loan terms

#### Loan Request Model (`tests/models/loan_request.test.js`)
- Tests loan request creation
- Validates request amount (must be positive)
- Verifies date validations (request date, expiry date)
- Tests status transitions
- Validates relationships with users and cryptocurrencies

#### Collateral Model (`tests/models/collateral.test.js`)
- Tests collateral creation
- Validates amount requirements
- Tests status transitions
- Verifies relationship with deals

#### Wallet Model (`tests/models/wallet.test.js`)
- Tests wallet creation
- Validates balance operations
- Tests cryptocurrency relationships
- Verifies user associations

#### Interest Term Model (`tests/models/interest_term.test.js`)
- Tests interest term creation
- Validates interest rate ranges
- Tests loan length requirements
- Verifies term calculations

#### Cryptocurrency Model (`tests/models/cryptocurrency.test.js`)
- Tests cryptocurrency creation
- Validates symbol and name requirements
- Tests uniqueness constraints

### Database Seeding
The project includes a seed script that populates the database with initial data for testing and development. To use it:

1. Ensure your MongoDB connection is configured
2. Run:
```bash
  npm run seed
```
3. The script will create:
   - Test users (including an admin user)
   - Sample cryptocurrency data
   - Interest terms
   - Loan requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Add your changes (`git add .`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## Technology Decisions and Alternatives

This project builds on the architectural, methodological, and design foundations outlined in [Planning & Design Documentation](/docs/assignment-1/DEV1003_Assessment_01.pdf). In that document, we proposed an Express + MongoDB stack, justified by its flexibility, alignment with JavaScript across the stack, and ease of use for small teams.

Below is a summary comparing our chosen technologies with alternatives that were considered:

| Category         | Chosen Tool         | Alternatives             | Rationale                                                                 |
|------------------|----------------------|---------------------------|---------------------------------------------------------------------------|
| Web Framework     | **Express.js**       | Koa, Fastify, Hapi        | Express is lightweight, well-documented, and backed by a large ecosystem. Ideal for learning and rapid API development. |
| Database          | **MongoDB**          | PostgreSQL, MySQL         | MongoDB’s schema-less structure allows rapid iteration. Its JSON-native design integrates smoothly with Node.js and Mongoose. |
| ORM / ODM         | **Mongoose**         | Prisma, Sequelize         | Mongoose simplifies data modeling, validation, and lifecycle hooks. Perfect for MVC pattern adopted in our design. |
| Authentication    | **JWT (jsonwebtoken)** | Passport.js, OAuth2       | JWT enables stateless, scalable authentication. It was simpler to implement in a learning context than OAuth2. |
| Testing Framework | **Jest + Supertest** | Mocha + Chai              | Jest offers a modern, all-in-one testing suite; Supertest is well-paired for endpoint testing. |
| Project Mgmt.     | **GitHub Kanban + Agile Sprints** | Trello, Jira            | GitHub Projects integrated well with our repo and enabled real-time task visibility and collaboration. |
| Methodology       | **Hybrid Waterfall-Agile** | Full Agile, Full Waterfall | This hybrid approach supported thorough initial planning while allowing iterative development with flexibility. |

These decisions reflect a balance between scalability, learning goals, and time constraints of the unit. For full justification of our architectural and planning choices, see the linked design document.

## Team

Developed as part of Coder Academy's Advanced Applications Subject (DEV1003) - Assessment 2, as a collaboration between:

### Tyson Williams
- [GitHub Profile](https://github.com/TysonPWilliams)
- [LinkedIn](https://www.linkedin.com/in/tysonpwilliams/)

### Adrian Gidaro
- [GitHub Profile](https://github.com/adriangcodes)
- [LinkedIn](https://www.linkedin.com/in/adriangidaro)

## License

This project is licensed under the MIT License - please see [LICENSE](docs/LICENSE.md) file for details.

## Package Licensing

This project relies on a number of open-source packages, each governed by their respective licenses. Below is a summary of licenses for key dependencies:

### Core Dependencies

- [**bcrypt (v5.1.1)**](https://github.com/kelektiv/node.bcrypt.js/blob/master/LICENSE) – BSD License  
- [**cookie-parser (v1.4.7)**](https://github.com/expressjs/cookie-parser/blob/master/LICENSE) – MIT License  
- [**cors (v2.8.5)**](https://github.com/expressjs/cors/blob/master/LICENSE) – MIT License  
- [**dotenv (v16.5.0)**](https://github.com/motdotla/dotenv/blob/master/LICENSE) – BSD-2-Clause License  
- [**express (v5.1.0)**](https://github.com/expressjs/express/blob/master/LICENSE) – MIT License  
- [**express-jwt (v8.5.1)**](https://github.com/auth0/express-jwt/blob/master/LICENSE) – MIT License  
- [**helmet (v8.1.0)**](https://github.com/helmetjs/helmet/blob/main/LICENSE) – MIT License  
- [**jsonwebtoken (v9.0.2)**](https://github.com/auth0/node-jsonwebtoken/blob/master/LICENSE) – MIT License  
- [**mongodb (v6.16.0)**](https://www.mongodb.com/licensing/server-side-public-license) – Server Side Public License (SSPL)  
- [**mongoose (v8.15.0)**](https://github.com/Automattic/mongoose/blob/master/LICENSE) – MIT License  

### Development Dependencies

- [**jest (v29.7.0)**](https://github.com/jestjs/jest/blob/main/LICENSE) – MIT License  
- [**supertest (v7.1.1)**](https://github.com/visionmedia/supertest/blob/master/LICENSE) – MIT License  
- [**mongodb-memory-server (v10.1.4)**](https://github.com/nodkz/mongodb-memory-server/blob/main/LICENSE) – MIT License  

Please consult each package’s official repository for full license details.

This project benefits from using open-source packages with permissive licenses such as MIT and BSD. These licenses grant broad rights to use, modify, and distribute the software with minimal obligations — typically just crediting the original authors. This flexibility is ideal for academic, experimental, and commercial development alike.

MongoDB is licensed under the Server Side Public License (SSPL), which permits use, modification, and distribution of the database software. For developers hosting their own applications that use MongoDB — including commercial platforms — the SSPL imposes no special obligations. However, if a service provider modifies and offers MongoDB as a service to others, they are required to publicly release their full service-side source code. Our use of MongoDB is limited to backend data handling for this project and does not involve redistributing it as a managed service, so the SSPL presents no constraints on our development or deployment.

## Project References

Chandan, D. 2023, Building a strong Node.js controller-based folder structure, Medium, viewed 18 May 2025, https://developerchandan.medium.com/building-a-strong-node-js-controller-based-folder-structure-a96c90ae667c.

Gyawali, V. 2023, Mastering Mongoose pre-hooks: A guide to enhancing data manipulation, Medium, viewed 18 May 2025, https://medium.com/@vikramgyawali57/mastering-mongoose-pre-hooks-a-guide-to-enhancing-data-manipulation-efbec44fc66f.

indexzero 2014, Node.js process event ‘uncaughtException’ caveats, GitHub Gist, viewed 31 May 2025, https://gist.github.com/indexzero/10602128.

Kumar, F. 2023, Mastering Express.js controllers: The key to clean and scalable applications, Medium, viewed 18 May 2025, https://medium.com/@finnkumar6/mastering-express-js-controllers-the-key-to-clean-and-scalable-applications-45e35f206d0b.

Manalad, J. 2019, ‘Pre-save hooks in Mongoose.js’, Medium, viewed 18 May 2025, https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2.

Mongoose 2024, Mongoose documentation, Mongoose, viewed 17 May 2025, https://mongoosejs.com/docs/