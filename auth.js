import { expressjwt } from 'express-jwt'
import jwt from 'jsonwebtoken'
import User from './models/user.js'


// This function authenticates users using a JWT stored in an HTTP-only cookie
export function auth(req, res, next) {

    // Extract the JWT from the token in the incoming request
    let token = req.cookies.token

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).send({ error: "No token provided." })
    }

    // Verify the token using the secret
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: 'Invalid or expired token.' })
        }
        
        // Attach the decoded payload to the reqest object
        // This allowes downstream middleware or route handlers to access auth user info
        req.auth = decoded;
        next()
    })
}

export function adminOnly(req, res, next) {
    if (req.auth) {
        User.findOne({ email: req.auth.email }).then(user => {
            if (user && user.isAdmin) {
                next()
            } else {
                res.status(403).send({ error: 'Admin access only.' })
            }
        })
    } else {
        res.status(403).send({ error: 'Unauthorized.' })
    }
}

export default { auth, adminOnly }