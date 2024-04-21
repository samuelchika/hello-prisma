import * as dotEnv from 'dotenv';
dotEnv.config();


import app from "./ExpressConfig";
// @ts-ignore
const PORT = parseInt(process.env.PORT) || 9090;


const initServer = async () => {
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
}
  
initServer();