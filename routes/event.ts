import { Response, Request, Router, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";

import path from "path";
import stream from 'stream';
import multer from 'multer';
import { authenticated } from "../middleware";
import Email from "../utils/Email";

// @ts-ignore
import {google} from 'googleapis';
// import * as docs from '@googleapis/docs'

const router = Router();
const upload = multer();

const prisma = new PrismaClient();

const KEYFILEPATH = path.join(__dirname, "../cred.json");
const SCOPE = ["https://www.googleapis.com/auth/drive"];
// eslint-disable-next-line import/no-extraneous-dependencies
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPE
});

router.post("/", upload.single('image'), async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        
        const drive = google.drive({version: 'v3', auth: auth});
        const fileMetaData = {
            name: req.file.originalname,
            parents: ["12ab1TBtMJclXssnr4gjicZWtLdVYhvq4"]
        }
        // readable stream
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        // create a media from the stream file
        const media = {
            mimeType: req.file.mimetype,
            body: bufferStream
        }
        const file = await drive.files.create({
            requestBody: fileMetaData,
            media
        });
        
        // how to acces the file
        //const imageUrl1 = `https://drive.google.com/uc?export=view&id=${file.data.id}`;
        const image = `https://drive.google.com/file/d/${file.data.id}`;
        console.log("URL 1: ", image)
        // image is now uploaded
        const payload = { ...req.body, image }
        console.log(payload)
        const event = await prisma.event.create({
            data: payload
        });
        
        return res.status(200).json({status: 'success', event })
        
    } catch (error) {
        console.error(error)
        next(error)
    }
});

router.get("/", async (req:Request | any, res: Response, next: NextFunction) => {
    try {
        const events = await prisma.event.findMany();
        res.status(200).json({success: true, events})
    } catch (error) {
        next(error)
    }
})

export default router;
