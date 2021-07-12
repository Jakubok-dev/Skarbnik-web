import crypto from "crypto";
import { applogger } from "./app";
import ms from "ms";
import { fromLogger, Logger } from "./logging/logger";

export class AppToken {
    
    userID :string;    
}

let logger :Logger;

const generateToken = () => {
    tokenSecret = crypto.randomBytes(64).toString(`hex`);
    logger.log(`The token secret has been changed to \n${tokenSecret}`);
}
export let tokenSecret :string;

export const initTokenGeneration = () => {

    logger = fromLogger(applogger, `token`);

    const intervalTime = ms(process.env.TOKEN_SECRET_MAX_AGE) || ms(`7d`);

    if (intervalTime === ms(`7d`))
        logger.log(`The token secret max age is set to 7d.`);
    else
        logger.log(`The token secret max age is set to ${process.env.TOKEN_SECRET_MAX_AGE}`);

    generateToken();
    setInterval(generateToken, intervalTime);
}