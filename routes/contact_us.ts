import { Response, Request, Router, NextFunction } from "express";


import Email from "../utils/Email";
import { generateContactUsEmail } from "../utils";

const router = Router();

router.post("/", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
      if(req.body.email) {
        const email = new Email();
        const emailOption =  {
            from: `"${req.body.firstname} ${req.body.lastname} " <${process.env.SMTP_USER}>`, 
            to: "samuelemyrs@gmail.com",
            replyTo: req.body.email, 
            subject: "Contact Us Form", 
            html: generateContactUsEmail(`${req.body.firstname} ${req.body.lastname}`, req.body.message, req.body.date),
        }
        await email.sendEmail(emailOption);  

        return res.status(200).json({ success: true, message: "Your message have been sent. Someone will reach out soon. Remain blessed." })
      }
      return res.status(404).json({ success: false, message: "Unknown Activity"})
    } catch (error) {
        process.env.NODE_ENV === "dev" && console.log(error)
        next(error)
    }
});

export default router;