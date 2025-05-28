# P2P Crypto Lending Backend

A secure and efficient backend system for peer-to-peer cryptocurrency lending, built with Node.js and Express. Developed as part of Coder Academy's Web Development Unit (DEV1003) - Assessment 2.

## Overview

SatoshiFund is a back-end API built for a peer-to-peer cryptocurrency lending platform. It enables users to securely lend and borrow crypto assets, manage collateral, and track deals and transactions. The app simulates core lending workflows and adheres to industry-standard practices for authentication, data validation, and route protection.

Developed with Node.js, Express, and MongoDB, the app prioritizes modular architecture, secure authentication (via JWT), and robust error handling. Mongoose provides schema validation and clean data modeling. The platform uses RESTful principles to deliver predictable endpoints and supports role-based access control to protect sensitive operations.

Built as part of a collaborative full-stack project, SatoshiFund showcases scalable backend design and practical implementation of modern web development best practices.

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
- **Storage:** 500 MB free space for codebase and MongoDB data
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

This project was developed as a collaborative effort by:

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

Kumar, F. 2023, Mastering Express.js controllers: The key to clean and scalable applications, Medium, viewed 18 May 2025, https://medium.com/@finnkumar6/mastering-express-js-controllers-the-key-to-clean-and-scalable-applications-45e35f206d0b.

Manalad, J. 2019, ‘Pre-save hooks in Mongoose.js’, Medium, viewed 18 May 2025, https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2.

Mongoose 2024, Mongoose documentation, Mongoose, viewed 17 May 2025, https://mongoosejs.com/docs/