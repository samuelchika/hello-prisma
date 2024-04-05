// import global dependencies
import express from "express"
import { errorHandler, unknownRoute } from "./errors"
import auth from './routes/auth';


//import project dependencies


// Express initialiazation
const app = express()


// middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes
app.use("/auth", auth);

// Error Handling
app.use(unknownRoute)
app.use(errorHandler)
export default app