import { networkInterfaces } from "os";
import { fromLogger } from "../logging/logger";
import { applogger } from "../app";

export const getCorsOrigins = () => {

    const logger = fromLogger(applogger, `getCorsOrigins`);

    const origins :string[] = [];
    const originport = process.env.CORS_ORIGIN_PORT;

    const localhostprotocol = process.env.IS_LOCALHOST_HTTPS === 'true' ? "https" : "http";
    const localIPsprotocol = process.env.ARE_LOCAL_IP_ADRESSES_HTTPS === 'true' ? "https" : "http";

    if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "")
        origins.push(process.env.CORS_ORIGIN);

    if (process.env.LOCALHOST_IS_CORS_ORIGIN === 'true')
        origins.push(`${localhostprotocol}://localhost:${originport}`);

    if (process.env.LOCAL_IP_ADRESSES_ARE_CORS_ORIGINS === 'true') {
        const nets = networkInterfaces();

        for (const name of Object.keys(nets)) {
            
            for (const net of nets[name]!) {
                if (net.family === 'IPv4' && !net.internal) {
                    if (net.family === 'IPv4' && !net.internal) {
                        if (origins.filter(el => el === net.address).length > 0)
                            continue;
                        origins.push(`${localIPsprotocol}://${net.address}:${originport}`);
                    }
                }
            }
        }
    }
    logger.log(`Allowed CORS origins: `);
    origins.forEach(el => logger.log(el));
    return origins;
}