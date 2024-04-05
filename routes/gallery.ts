import { Response, Request, Router, NextFunction } from "express";
import path from "path";


import {google} from 'googleapis';
// import * as docs from '@googleapis/docs'

const router = Router();

const KEYFILEPATH = path.join(__dirname, "../cred.json");
const SCOPE = ["https://www.googleapis.com/auth/drive"];

// eslint-disable-next-line import/no-extraneous-dependencies
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPE
});

router.post("/", async (req:Request, res: Response, next: NextFunction) => {
    try {
        const { pageToken } = req.body;

        console.log(pageToken)
    const drive = google.drive({version: 'v3', auth: auth});
    const ress = await drive?.files.list({
        includeDeleted: false,
        pageSize: 2,
        pageToken,        
    });
    const { nextPageToken, files } = ress.data;
    console.log(files)
    // @ts-ignore
    const images = files.map(file => {
        return `https://drive.google.com/file/d/${file.id}`
    })
    const payload = {
        images, 
        pageToken: nextPageToken
    }
    // send the nextpage token with the list of image gotten back and use it get the next images
    
    res.status(200).json({success: true, payload})
    } catch (error) {
        next(error)
    }

})


export default router;