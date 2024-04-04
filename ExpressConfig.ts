// import global dependencies
import express from "express"
import { errorHandler } from "./errors"



//import project dependencies


// Express initialiazation
const app = express()


// middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes



// Error Handling
app.use(errorHandler)
export default app