// import global dependencies
import express from "express"
import { errorHandler, unknownRoute } from "./errors"
import auth from './routes/auth';
import gallery from './routes/gallery';
import event from './routes/event';
import subscribe from './routes/subscribe';

//import project dependencies


// Express initialiazation
const app = express()


// middlewares
app.use(express.static('uploads'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes
app.use("/auth", auth);
app.use("/event", event);
app.use("/gallery", gallery);
app.use("/subscribe", subscribe);

// Error Handling
app.use(unknownRoute)
app.use(errorHandler)
export default app