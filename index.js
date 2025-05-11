import 'dotenv/config' // Load environment variables from .env file
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { connect } from './db.js'

// console.log(process.env) // Check if environment variables are loaded correctly

const app = express()
const port = 8080

app.use(helmet());
app.use(cors());

app.use(express.json());


// TODO: Add your routes to use here


// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status).send({error: err.message})
});


app.listen(port, async () => {
    console.log(`Back-end is listening on port ${port}`)
    connect()
});