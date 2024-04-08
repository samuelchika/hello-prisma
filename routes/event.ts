import { Response, Request, Router, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import Email from "../utils/Email";

import { authenticated } from "../middleware";
import { eventUpload } from "../middleware";

import { generateEventEmail } from "../utils";

const router = Router();

const prisma = new PrismaClient();


router.post("/", authenticated, eventUpload.single('image'), async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        // get the request body
        const payload = { ...req.body, image: req.file.filename}
        const event = await prisma.event.create({
            data: payload
        });
        // get the email of everyone subscribed to mail them of the upcoming event.
        const subscribed = await prisma.subscribe.findMany();
        const email = new Email();
        
        subscribed.forEach(async ({ email: subscriberEmail }) => {
            const emailOption =  {
                from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
                to: subscriberEmail, 
                subject: event.title, 
                html: generateEventEmail(event.title, event.description.substring(30), `${process.env.FRONTEND}/event/${event.id}`),
            }
            await email.sendEmail(emailOption);          
        })
        res.status(200).json({ success: true, event: { ...event, image: `${process.env.BACKEND}/events/${event.image}`}});
    } catch (error) {
        process.env.NODE_ENV === "dev" && console.log(error)
        next(error)
    }
    
})
router.get("/:id", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({
            where: {
                id
            },
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true
                    }
                }
            }
        });
        return !event 
        ? res.status(404).json({ success: false, message: "Event not found"})
        : res.status(200).json({success: true, event})
    } catch (error) {
        next(error)
    }
});

router.get("/", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        const events = await prisma.event.findMany({
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true
                    }
                }
            }
        });
        res.status(200).json({success: true, events})
    } catch (error) {
        next(error)
    }
});



export default router;
