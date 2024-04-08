import { Response, Request, Router, NextFunction } from "express";
import { generateChangePasswordEmail, generateChangedPasswordEmail, generateRegEmail, generateAdminEmail, generateToken, generateValidatedEmail, hashPassword, verifyPassword } from "../utils";
import { PrismaClient, User } from "@prisma/client";
import { authenticated, isAdmin } from "../middleware";
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
    });
    const token = await generateToken(req.body, "2 hours");
    // send an email to the person to verify their account.
    const emailOption = {
      from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
      to: req.body.email, 
      subject: "Account Verification 🔓", 
      html: generateRegEmail(req.body.firstname, `${process.env.FRONTEND}/verify_account/${token}`),
    } 
    const email = new Email();
    const sent = await email.sendEmail(emailOption);
    const payload: any = user
    delete payload.password;
    return sent ? res.status(201).json({ payload, success: true, message: "User account created successfully!"}) : res.status(201).json({ payload, success: true, message: "User account created but contact admin if you don't receive a verification email!"})
  } catch (error) {
    console.log(error)
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
      html: generateValidatedEmail(req.user.firstname),
    } 

    const email = new Email();
    await email.sendEmail(emailOption);
    return res.status(201).json({ success: true, message: "User account verified successfully! You can Login now"}) 
  } catch (error) {
    next(error)
  }
})

router.post("/login",async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email}
    });
    // user not found
    if (!user) {
      return res.status(401).json({success: false, message: "Invalid Credential"});
    } 

    if(!user.active){
      return res.status(401).json({success: false, message: "Please verify your account from your email. If link have expire, contact Admin"});
    }
    const hashedPassword = user.password || ''
    const isValid = user && await verifyPassword(req.body.password, hashedPassword)
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
    
    // send email using the token.
    const user = await prisma.user.findUnique({
      where: { email: req.body.email}
    })
    if(!user) {
      return res.status(200).json({success: true, message: "If your account exist, a reset password link will be sent to you."})
    }
    const payload = { email: req.body.email };
    const token = await generateToken(payload, "2 hours")
    const link = `${process.env.FRONTEND}/change_password/${token}`
    const emailOption = {
      from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
      to: req.body.email, 
      subject: "Account Verification 🔓",  
      html: generateChangePasswordEmail(user?.firstname, link),
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
    // confirm password and confirm password match
    if (req.body.password !== req.body.confirm_password) {
      return res.status(200).json({status: false, message: "Password Mismatch!"})
    }
    const user = await prisma.user.findUnique({
      where: { email: req.body.email}
    })
    if(!user) {
      return res.status(200).json({success: true, message: "If your account exist, a reset password link will be sent to you."})
    }
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
    const token = await generateToken({email: req.body.email}, "2 hours");
    const emailOption = {
      from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
      to: req.body.email, 
      subject: "Account Verification 🔓",  
      html: generateChangedPasswordEmail(user.firstname, token),
    } 
    const email = new Email();
    await email.sendEmail(emailOption)
    return res.status(200).json({ success: true, message: "Password Changed successfully"})
  } catch (error) {
    next(error)
  }
});

router.post("/update_user", authenticated, isAdmin, async (req:Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body;
    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        role: "ADMIN"
      }
    });
    const email = new Email();
    const emailOption = {
      from: `"RCCG Excel Parish " <${process.env.SMTP_USER}>`, 
      to: user.email, 
      subject: "Account Upgraded",  
      html: generateAdminEmail(user.firstname,),
    }
    await email.sendEmail(emailOption);
    res.status(200).json({ success: true, message: "User upgraded to Admin"})
  } catch (error) {
    process.env.NODE_ENV === "dev" && console.log(error)
    next(error);
  }
})

router.get("/users", authenticated, isAdmin, async (req:Request, res: Response, next: NextFunction) => {
  try {
    const users  = await prisma.user.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        active: true,
        createdAt: true,
        role: true
      }
    });
    res.status(200).json({ success: true, users})
  } catch (error) {
    process.env.NODE_ENV === "dev" && console.log(error)
    next(error)
  }
});

router.delete("/user/:id", authenticated, isAdmin, async (req:Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where:{
        id
      }
    });
    res.status(200).json({ success: true, message: "User account deleted!" });
  } catch (error) {
    process.env.NODE_ENV === "dev" && console.log(error)
    next(error)
  }
})


export default router;