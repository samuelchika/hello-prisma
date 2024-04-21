import { Response, Request, Router, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import Email from "../utils/Email";
import { authenticated, isAdmin, eventUpload } from "../middleware";
import fs from 'fs';
import path from "path";

import { generateEventEmail } from "../utils";

const router = Router();

const prisma = new PrismaClient();


router.post("/", authenticated, isAdmin, eventUpload.single('image'), async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        // get the request body
        const payload = { ...req.body, image: req.file.filename, authorId: req?.user.id}
        const event = await prisma.event.create({
            data: payload
        });
        // get the email of everyone subscribed to mail them of the upcoming event.
        const subscribed = await prisma.subscribe.findMany();
        const email = new Email();
        
        subscribed?.forEach(async ({ email: subscriberEmail }) => {
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
    
});

router.put("/:id",authenticated, isAdmin, eventUpload.single('image'), async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        let data = {...req.body, authorId: req?.user?.id};
        const { id } = req.params;
        console.log(id)
        const event = await prisma.event.findUnique({
            where: {
                id
            }
        });
        console.log(req.body)
        if(!event) {
            return res.status(404).json({ success: false, message: "Event not found"})
        }

        
        // delete image from location 
        if(req?.file?.filename) {
            const fileLocation = path.join(__dirname, "../uploads/events/");
            fs.unlink(`${fileLocation}${event?.image}`, (err) => {
                if (err) throw err;
                process.env.NODE_ENV === "dev" && console.log(`${fileLocation}${event?.image} was deleted`);
            })
            data = { ...req.body, image: req.file.filename }
        }
        delete data["id"]
        delete data["authorId"]
        await prisma.event.update({
            where: {
                id: id
            },
            data
        });        
        res.status(200).json({success: true, message: `Event ${req.body.title} updated successfully.`})
    } catch (error) {
        next(error)
    }
});

router.delete("/:id", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.event.delete({
            where: {
                id
            }
        });
        
        res.status(200).json({success: true, message: `Event deleted successfully.`})
    } catch (error) {
        next(error)
    }
});

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
        : res.status(200).json({success: true, event: {...event, image: `${process.env.BACKEND}/events/${event.image}`}})
    } catch (error) {
        next(error)
    }
});

router.get("/", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        const raw_events = await prisma.event.findMany({
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true
                    }
                }
            }
        });
        const events = raw_events?.map(event => ({...event, image: `${process.env.BACKEND}/events/${event.image}`}))
        res.status(200).json({success: true, events})
    } catch (error) {
        next(error)
    }
});



export default router;
