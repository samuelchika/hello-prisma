import bcrypt from "bcrypt";
import { V4 } from "paseto";
export const verifyPassword = (plainPassword: string, hash: string | '') => {
    return bcrypt.compareSync(plainPassword, hash)
}

export const hashPassword = async (password: string) => {
    console.log(password)
    return bcrypt.hashSync(password, 10);
}

export const generateToken = async (payload: Record<string, unknown>, expireIn: string): Promise<string> => {
    const secretKey =  process.env.PRIVATE_KEY || "";
        const token = await V4.sign(payload, secretKey, {
            audience: 'https://www.rccgexcelparish.com',
            issuer: 'https://www.rccgexcelparish.com',
            subject: "User validation Token",
            expiresIn: expireIn || '2 hours'
        });
    return token;
}

export const verifyToken = async (token: string) => {
    try {
        const publicKey = process.env.PUBLIC_KEY || "";
        const payload = await V4.verify(token, publicKey, {
            audience: 'https://www.rccgexcelparish.com',
            issuer: 'https://www.rccgexcelparish.com',
            subject: "User validation Token",
            complete: false,
        });
        
        return { valid: true, payload };
    } catch (error) {
        return {valid: false, message: "Please Login"}
    }
}

export const generateRegEmail = (name: string, link: string) : string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-200 p-4 text-lg w-full">


    <div class="text-lg space-y-4 max-w-[500px] mx-auto space-y-6 " style="font-family: urbanist">
    <h1 class="text-2xl">Welcome ${name}</h1>
    <p class="my-4 text-justify">Please click on the button below to verify your account. This link will expire after 2hours of sending. Then you have to contact Admin using the contact form.</p>
    <div class="my-4">
    <a href="${link}" target="_blank" class="btn bg-blue-400  p-2 px-4 rounded-md text-white font-bold">Verify Account </a>
    </div>
    </div>


    </body>
    </html>    
    `
}

export const generateValidatedEmail = (name: string) : string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-200 p-4 text-lg w-full">


    <div class="text-lg space-y-4 max-w-[500px] mx-auto space-y-6 " style="font-family: urbanist">
    <h1 class="text-2xl">Welcome ${name}</h1>
    <p class="my-4 text-justify">You account is now verified 😁. You can now Login</p>
    
    </div>


    </body>
    </html>    
    `
}

export const generateChangePasswordEmail = (name: string, link: string) : string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-200 p-4 text-lg w-full">


    <div class="text-lg space-y-4 max-w-[500px] mx-auto space-y-6 " style="font-family: urbanist">
    <h1 class="text-2xl">Oops! ${name}</h1>
    <p class="my-4 text-justify">Click on the  link below to change your password.</p>
    <div class="my-4">
    <a href="${link}" target="_blank" class="btn bg-blue-400  p-2 px-4 rounded-md text-white font-bold">Verify Account </a>
    </div>
    </div>


    </body>
    </html>    
    `
}

export const generateChangedPasswordEmail = (name: string, link: string) : string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-200 p-4 text-lg w-full">


    <div class="text-lg space-y-4 max-w-[500px] mx-auto space-y-6 " style="font-family: urbanist">
    <h1 class="text-2xl">Congrats! ${name}</h1>
    <p class="my-4 text-justify">Your password have now been changed. If you did not request for the change of password, click on the link below.</p>
    <div class="my-4">
    <a href="${link}" target="_blank" class="btn bg-blue-400  p-2 px-4 rounded-md text-white font-bold">Verify Account </a>
    </div>
    </div>


    </body>
    </html>    
    `
}