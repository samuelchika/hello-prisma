import { Response, Request, Router, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticated, galleryUpload, isAdmin } from "../middleware";
import fs from 'fs';
import path from "path";

const router = Router();

const prisma = new PrismaClient();

router.post("/", authenticated, galleryUpload.array('images'), async (req:Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        if(req.files?.length > 0) {
            const images = req.files;
            // @ts-ignore
            await images?.forEach(async ({filename}) => {
                await prisma.gallery.create({
                    data: {
                        image: filename
                    }
                });
            });
            // @ts-ignore
            const uploaded = await prisma.gallery.findMany(); // get all the images from the db
            const gallery = uploaded.sort((a, b): number => {
                //@ts-ignore
                return Date.parse(b.createdAt) - Date.parse(a.createdAt);
            }).map(({id, image}) => ({
                id, image: `${process.env.BACKEND}/gallery/${image}`
            })); // generate the image array to be displayed, both Old and new
            return res.status(200).json({ success: true, gallery})
        }
        return res.status(200).json({ success: false, message: "No image was uploaded!"})
    } catch (error) {
        process.env.NODE_ENV === "dev" && console.log(error)
        next(error)
    }
});

router.get("/", async (req:Request, res: Response, next: NextFunction) => {
    try {
        const uploaded = await prisma.gallery.findMany(); // get all the images from the db
        console.log(uploaded)
        const gallery = uploaded.sort((a, b): number => {
            //@ts-ignore
            return new Date(b.createdAt) - new Date(a.createdAt);
        }).map(({id, image }) => ({
            id, image: `${process.env.BACKEND}/gallery/${image}`
        })); // generate the image array to be displayed, both Old and new

        return res.status(200).json({ success: true, gallery})
    } catch (error) {
        process.env.NODE_ENV === "dev" && console.log(error)
        next(error)
    }
});

router.delete("/:id", authenticated, isAdmin, async (req:Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const fileLocation = path.join(__dirname, "../uploads/gallery/")
        const image = await prisma.gallery.findUnique({
            where: {
                id
            }
        });
        await prisma.gallery.delete({
            where: {
                id
            }
        });
        fs.unlink(`${fileLocation}${image?.image}`, (err) => {
            if (err) throw err;
            process.env.NODE_ENV === "dev" && console.log(`${fileLocation}${image?.image} was deleted`);
        });
        res.status(200).json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        process.env.NODE_ENV === "dev" && console.log(error)
        res.status(404).json({ success: false, message: "Image does not exist. Please refresh your browser or clear cache"})
    }
});

export default router;