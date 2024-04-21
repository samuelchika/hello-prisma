// import global dependencies
import express from "express";
import cors from 'cors';
import { errorHandler, unknownRoute } from "./errors"
import auth from './routes/auth';
import gallery from './routes/gallery';
import event from './routes/event';
import subscribe from './routes/subscribe';
import contact_us from './routes/contact_us'

//import project dependencies


// Express initialiazation
const app = express()


// middlewares
app.use(cors())
app.use(express.static('uploads'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes
app.use("/auth", auth);
app.use("/event", event);
app.use("/gallery", gallery);
app.use("/subscribe", subscribe);
app.use("/contact_us", contact_us);

// Error Handling
app.use(unknownRoute)
app.use(errorHandler)
export default app