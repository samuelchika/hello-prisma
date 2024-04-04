import { createPrivateKey, generateKeyPairSync  } from "crypto"
import { V4 } from "paseto";

const payload = {
    username: "Sam",
};

export default async function testPaseto () {
    const {publicKey, privateKey } = generateKeyPairSync('ed25519', 
    {
        modulusLength: 4096,
        publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
        },
        privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: ''
        }
    });

    console.log(publicKey, privateKey)
    // const keyObject = createPrivateKey({  
    //     key: privateKey,
    //     format: "pem",
    //     type: "pkcs1",
    //     passphrase: "",
    //     encoding: "utf-8"
    // });
    const token = await V4.sign(payload, privateKey, {
        audience: 'urn:example:client',
        issuer: 'https://op.example.com',
        expiresIn: '2 hours'
      })
    console.log(token)
}