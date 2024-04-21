import { NextFunction, Request, Response } from "express"
import { deleteImage, verifyToken } from "./utils"
import multer from "multer"
import { schemas } from './validation';
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
        console.log(req.body)
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

export const schemaValidation = () => {
    // supported methods for validation 
    const supportedMethods = ['post', 'put'];

    // validation options
    const validationOption = {
        abortEarly: false,  // abort after the last validation error
        allowUnknown: true, // allow unknown keys that will be ignored
        stripUnknown: true  // remove unknown keys from the validated data
    }

    return async (req: Request | any, res: Response, next: NextFunction) => {
        try {
            // this is where the manipulation happens
            // get the route the users is visiting to determine which schema to use
            const route: string = req.originalUrl;
            // * which request method is the user trying to access
            const method = req.method.toLowerCase();
            console.log(method)
            if(supportedMethods.includes(method) && (route in schemas)) {
                // Get the schema for the route 
                // @ts-expect-error getting the required schema
                const schema = schemas[route];
                if(schema) {
                    // means we successfully got the route
                    // validation should start
                    const { value, error} = schema.validate(req.body, validationOption);
                    if (error) {
                        // check if there was an upload before validation
                        if(req.files) {
                            req.files.forEach(({ filename } : { filename: string}) => {
                                deleteImage(filename);
                            });
                        }
                        var msg = error.details.map((er: any) => er.message).join(',');
                        if(msg.includes("confirm_password")) {
                            msg = "Password mismatch! Password and Confirm Password must match";
                        }
                        if (msg.includes("password") && !msg.includes("confirmPassword"))
                            msg = "Password must be strong. \nAt least one uppercase alphabet [A-Z]. \nAt least one lowercase alphabet [a-z]. \nAt least one digit [0-9]. \nAt least one special character - (#?!@$%^&*-). \nMinimum of eight characters in length"
            
                        res.status(422).json({ message: msg})
                    } else {
                        req.body = value;
                        next();
                    }
                }  else {
                    res.status(422).json({ message: "Validation Error! Please contact Admin."})
                }
            } else {
                process.env.NODE_ENV === 'dev' && console.log("Skipped Validation")
                next();
            }
        } catch (error) {
            //console.log(error)
            next(error)
        }
    }
}