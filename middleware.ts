import { NextFunction, Request, Response } from "express"
import { verifyToken } from "./utils"
import multer from "multer"
export const authenticated = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
        console.log(req.headers.authorization.split(" ")[1])
        const token: string = req.headers.authorization.split(" ")[1] || "";
        const validate = await verifyToken(token)
        if (validate.valid) {
            // user token is valid
            req.user = validate.payload
            return next();
        }
        return res.status(401).json({...validate});
    } catch (error) {
        if(req.path.includes("verify")) {
            // this means its has to do with verification of password
            return res.status(401).json({ success: false, message: "Contact Admin via email. Token expired or Get new Token"})
        }
        return res.status(401).json({ success: false, message: "Please Login"})
    }
} 

const eventStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/events/');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.includes(" ") ? file.originalname.split(" ").join("") : file.originalname
        cb(null, Date.now() + '_' + name);
    }
});

const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/gallery/');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.includes(" ") ? file.originalname.split(" ").join("") : file.originalname
        cb(null, Date.now() + '_' + name);
    }
});

export const eventUpload = multer({ storage: eventStorage });
export const galleryUpload = multer({ storage: galleryStorage });

export const isAdmin = async (req: Request | any, res: Response, next: NextFunction) => {
    if(req.user.role === "ADMIN") {
        return next();
    }
    return res.status(403).json({ status: false, message: "FORBIDDEN!" });
}