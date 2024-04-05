import * as dotEnv from 'dotenv';
dotEnv.config();


import app from "./ExpressConfig";
const PORT = process.env.PORT || 9090;


const initServer = async () => {
    app.listen(8000, () => {
      console.log(`Listening on port ${PORT}`);
    });
}
  
initServer();