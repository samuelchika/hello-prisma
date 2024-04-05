import { Response, Request, Router, NextFunction } from "express";
import { generateChangePasswordEmail, generateRegEmail, generateToken, generateValidatedEmail, hashPassword, verifyPassword } from "../utils";
import { PrismaClient } from "@prisma/client";
import { authenticated } from "../middleware";
import Email from "../utils/Email";
import { UserProps } from "../lib";

const router = Router();

const prisma = new PrismaClient();
router.post("/register", async (req:Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body)
    const hashedPassword = await hashPassword(req.body.password);
    console.log(hashedPassword)
    const userData = {...req.body, password: hashedPassword, phone: parseInt(req.body.phone)}
    const user = await prisma.user.create({
      data: {
        ...userData
      }
    })
    const token = await generateToken(req.body, "2 hours");
    // send an email to the person to verify their account.
    const emailOption = {
      from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
      to: req.body.email, 
      subject: "Account Verification 🔓", 
      text: "Hello world?", 
      html: generateRegEmail(req.body.firstname, `${process.env.FRONTEND}/verify_account/${token}`),
    } 
    const email = new Email();
    const sent = await email.sendEmail(emailOption);
    return sent ? res.status(201).json({ user, success: true, message: "User account created successfully!"}) : res.status(201).json({ user, success: true, message: "User account created but contact admin if you don't receive a verification email!"})
  } catch (error) {
    next(error)
  }
})

router.post("/verify_account", authenticated, async (req:Request | any, res: Response, next: NextFunction) => {
  try {
    console.log(req.user)

    if(req?.user) {
      await prisma.user.update({
      where: {
        email: req.user.email
      },
      data: {
        active: true
      }
    })
    }


    const emailOption = {
      from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
      to: req.user?.email, 
      subject: "Account Verification 🔓", 
      text: "Hello world?", 
      html: generateValidatedEmail(req.body.firstname),
    } 

    const email = new Email();
    await email.sendEmail(emailOption);
    return res.status(201).json({ success: true, message: "User account verified successfully! You can Login now"}) 
  } catch (error) {
    next(error)
  }
})


router.post("/login",async (req, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email}
    });
    // user not found
    if (!user) {
      return res.status(401).json({success: false, message: "Invalid Credential"});
    } 
    const hashedPassword = user.password || ''
    const isValid = user && verifyPassword(req.body.password, hashedPassword)
    if (isValid) {
      // generate the token
      const payload: UserProps | any = user;
      delete payload.password;
      const token = await generateToken(payload, "24 hours");
      return res.status(200).json({success: true, user, token})
    } else {
      return res.status(401).json({success: false, message: "Invalid Credential"});
    }
  } catch (error) {
    next(Error)
  }
})

router.post("/forgot_password", async (req:Request, res: Response, next: NextFunction) => {
  try {
    const token = await generateToken(req.body.email, "2 hours")
    // send email using the token.
    const emailOption = {
      from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
      to: req.body.email, 
      subject: "Account Verification 🔓", 
      text: "Hello world?", 
      html: generateChangePasswordEmail(req.body.firstname, token),
    } 
    const email = new Email();
    await email.sendEmail(emailOption)

    res.status(200).json({ success: true, message: "Please check your email. The link sent to reset password will expire in 2 hours."})
  } catch (error) {
    next(error)
  }
});

router.post("/change_password", async (req:Request, res: Response, next: NextFunction) => {
  try {
    const hashedPassword = await hashPassword(req.body.password)
    await prisma.user.update({
      where: {
        email: req.body.email
      },
      data: {
        password: hashedPassword
      }
    });

    // report via email if it was not your. 
    return res.status(200).json({ success: true, message: "Password Changed successfully"})
  } catch (error) {
    next(error)
  }
} )


export default router;