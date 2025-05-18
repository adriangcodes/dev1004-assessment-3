import { expressjwt } from 'express-jwt'
import jwt from 'jsonwebtoken'
import User from './models/user.js'

// export function auth(req, res, next) {
//     return expressjwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })(req, res, next)
// }

export function auth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({error: "No token provided."})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({error: 'Invalid or expired token.'})
        }

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
                res.status(403).send({error: 'Admin access only.'})
            }
       })
    } else {
        res.status(403).send({error: 'Unauthorized.'})
    }
}

export default { auth, adminOnly }