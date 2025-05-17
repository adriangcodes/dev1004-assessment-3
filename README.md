# SatoshiFund

This is the back-end component of our group project for Coder Academy DEV1003 – Advanced Applications Assignment 2.

SatoshiFund is a back-end API built for a peer-to-peer cryptocurrency lending platform. It enables users to create wallets, list and manage cryptocurrencies, initiate loan requests, and facilitate crypto-backed lending deals. Developed with Node.js, Express, and MongoDB, the app prioritizes modular architecture, secure authentication (via JWT), and robust error handling. Mongoose provides schema validation and clean data modeling. The platform uses RESTful principles to deliver predictable endpoints and supports role-based access control to protect sensitive operations.

Built as part of a collaborative full-stack project, SatoshiFund showcases scalable backend design and practical implementation of modern web development best practices.

---

## 🔧 Technologies Used

### Runtime & Framework
- **Node.js**: JavaScript runtime for server-side development.
- **Express (v5)**: Web framework used for route handling and middleware.
- **MongoDB** with **Mongoose**: NoSQL database with schema modeling via Mongoose.

### Security & Auth
- **jsonwebtoken**: Used for JWT-based authentication.
- **express-jwt**: Middleware for protecting routes with JWT verification.
- **bcrypt**: Password hashing for secure user authentication.
- **helmet**: Secures HTTP headers.
- **cors**: Enables Cross-Origin Resource Sharing.

### Environment & Utilities
- **dotenv**: Loads environment variables from `.env` files.
- **nodemon** (`dev` only): Auto-restarts server during development.

---

## ⚙️ Hardware Requirements

- Node.js 18+ installed
- MongoDB (local or Atlas)
- 4GB+ RAM and internet access for package install and API functionality

---

## 📐 Style Guide

This project follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) via ESLint (configurable). Adherence ensures clean, readable, and maintainable code.

---

## 🔁 DRY Principle

- Modular architecture across routes, controllers, and models
- Common logic abstracted into middleware and utility helpers

---

## 🔐 Secure API Design

- Routes follow RESTful conventions with correct HTTP verbs
- Token-based auth using JWT stored in headers
- Headers, body, and param validation across all major endpoints
- Sensitive routes protected via `express-jwt`

---

## ✅ Testing

While test coverage is pending final implementation, the `test` script placeholder is configured in `package.json` for future Jest or Supertest integration.

```
npm test
```

---

## 🧪 Error Handling

- Custom middleware captures and responds to errors gracefully
- Uses HTTP status codes and informative error messages
- Missing resource, unauthorized access, and validation errors handled consistently

---

## 📄 Licensing

The following packages are used under their respective licenses:

- **express**, **mongoose**, **dotenv**, **jsonwebtoken**, **helmet**: MIT
- **express-jwt**: MIT
- **bcrypt**: ISC
- Project license: ISC

---

## 🧭 Alternatives Considered

| Tool         | Alternative   | Reason Chosen                      |
|--------------|---------------|------------------------------------|
| MongoDB      | PostgreSQL    | Flexible schema for early-stage dev |
| Express      | Fastify       | Simplicity and broad community     |
| JWT          | OAuth         | Lightweight for our API scope      |

---

## 📂 Setup Instructions

1. Clone the repo:
   ```
   git clone https://github.com/SatoshiFundAus/dev1003-p2p-crypto-lending-backend.git
   cd dev1003-p2p-crypto-lending-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file:
   ```
   JWT_SECRET="satoshi"
   MONGODB_URI=your_mongodb_uri
   ```

4. Run in dev mode:
   ```
   npm run dev
   ```

---

## 👥 Team & Collaboration

This project was built collaboratively as part of the DEV1003 assessment. Contributions were tracked via GitHub and coordinated using branches and pull requests. Each team member is also submitting a peer review reflecting individual input.

Team members:
- Tyson Williams: https://github.com/TysonPWilliams
- Adrian Gidaro: https://github.com/adriangcodes 

---

## Project References

Mongoose 2024, Mongoose documentation, Mongoose, viewed 17 May 2025, https://mongoosejs.com/docs/