import { Response, Request, Router, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";


import Email from "../utils/Email";
import { generateUnSubscribeEmail, generateSubscribeEmail } from "../utils";

const router = Router();

const prisma = new PrismaClient();

router.post("/", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        const payload = { email: req.body.email };
        // log this into the database.
        await prisma.subscribe.create({
            data: payload
        })
        const email = new Email();
        const emailOption =  {
            from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
            to: req.body.email, 
            subject: "Subscribe", 
            html: generateSubscribeEmail(),
        }
        await email.sendEmail(emailOption);  

        res.status(200).json({ success: true, message: "You have successfully subscribed. We will send you notifications, newsletter and events." })
    } catch (error) {
        process.env.NODE_ENV === "dev" && console.log(error)
        next(error)
    }
});

router.post("/unsubscribe", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        const payload = { email: req.body.email };
        // log this into the database.
        const subscribe = await prisma.subscribe.delete({
            where: payload
        })
        console.log(subscribe)
        const email = new Email();
        const emailOption =  {
            from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
            to: req.body.email, 
            subject: "Unsubscribe", 
            html: generateUnSubscribeEmail(),
        }
        await email.sendEmail(emailOption);  
        
        res.status(200).json({ success: true, message: "You have successfully unsubscribed." })
    } catch (error) {
        process.env.NODE_ENV === "dev" && console.log(error)
        next(error)
    }
});

export default router;