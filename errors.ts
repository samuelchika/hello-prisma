import { NextFunction, Request, Response } from "express";
import CustomError from "./CustomError";

export const unknownRoute = (req: Request, res: Response, next: NextFunction) => {
   next(new CustomError({ statusCode: 404, message: "Unknown Route"}))
  };

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    process.env.NODE_ENV == "dev" && console.error(err);
    let statusCode = 500; 
    let message = err.message || "Something went wrong!";
    if(err instanceof CustomError) {
        statusCode = err.statusCode;
    }
    res.status(statusCode).json({message});
  };