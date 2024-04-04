import { NextFunction, Request, Response } from "express";
import CustomError from "./CustomError";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    let statusCode = 500; 
    let message = err.message || "Something went wrong!";
    if(err instanceof CustomError) {
        statusCode = err.statusCode;
    }
    res.status(statusCode).json({message});
  };