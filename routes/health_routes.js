import { Router } from 'express'

const router = Router()

// This is a health endpoint that can be pinged freely
router.get('/health', (req, res) => {
    res.status(200).send('Server is healthy.')
})

export default router