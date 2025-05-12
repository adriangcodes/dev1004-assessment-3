import { expressjwt } from 'express-jwt'
import User from './models/user.js'

export function auth(req, res, next) {
    return expressjwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })(req, res, next)
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