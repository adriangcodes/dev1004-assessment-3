import express from 'express'
import { connect } from './db.js'

const app = express()
const port = 8080



app.listen(port, async () => {
    console.log(`Back-end is listening on port ${port}`)
    connect()
})