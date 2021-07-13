import { networkInterfaces } from "os";
import { fromLogger } from "../logging/logger";
import { applogger } from "../app";
import { CorsOriginsConfig } from "src/types";
import { readFileSync } from "fs";

export const getCorsOrigins = () => {

    const logger = fromLogger(applogger, `getCorsOrigins`);

    const origins :string[] = [];
    const config :CorsOriginsConfig = JSON.parse(readFileSync(`./corsconfig.json`).toString());

    const localIPsprotocol = config?.areLocalIPsHTTPS === true ? "https" : "http";

    if (config.localIPsAllowed === true && config.localIPsAllowedPorts) {
        const nets = networkInterfaces();

        for (const name of Object.keys(nets)) {
            
            for (const net of nets[name]!) {
                if (net.family === 'IPv4' && !net.internal) {
                    if (net.family === 'IPv4' && !net.internal) {

                        for (const port of config.localIPsAllowedPorts) {
                            if (origins.filter(el => el === `${localIPsprotocol}://${net.address}:${port}`).length === 0)
                                origins.push(`${localIPsprotocol}://${net.address}:${port}`);
                        }

                    }
                }
            }
        }
    }

    if (config.customAdressess) {
        for (const address of config.customAdressess) {
            if (!address.domain)
                continue;
            if (!address.ports)
                continue;

            for (const port of address.ports) {
                const protocol = address.isHTTPS === true ? `https` : `http`;

                if (origins.filter(el => el === `${protocol}://${address.domain}:${port}`).length === 0)
                    origins.push(`${protocol}://${address.domain}:${port}`);
            }
        }
    }

    logger.log(`Allowed CORS origins: `);
    origins.forEach(el => logger.log(el));
    return origins;
}