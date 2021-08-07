import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema, Query, Resolver } from "type-graphql";
import { Connection, createConnection } from "typeorm";
import { Logger } from "./logging/logger"
import { AccountResolver } from "./resolver/AccountResolver";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { AppToken, initTokenGeneration, tokenSecret } from "./token";
import { LogInResolver } from "./resolver/LoginResolver";
import cookieParser from "cookie-parser";
import { AUTHORISATION } from "./global";
import { PersonResolver } from "./resolver/PersonResolver";
import cors from "cors";
import { PermissionsManagerResolver } from "./resolver/PermissionsManagerResolver";
import { OrganisationResolver } from "./resolver/OrganisationResolver";
import { getCorsOrigins } from "./startup/getCorsOrigins";
import { seedDatabase } from "./startup/seedDatabase";
import { LoggingManager } from "./logging/loggingManager";
import { GroupResolver } from "./resolver/GroupResolver";
import { Organisation } from "./entity/Organisation";

dotenv.config();
export let applogger :Logger;
export let database :Connection;
export const expressserver = express();
export let apolloserver :ApolloServer;

const main = async () => {

    applogger = new Logger("app/server", new LoggingManager());
    applogger.log(`The skarbnik-teapot server is starting...`);

    database = await createConnection();
    await seedDatabase();

    initTokenGeneration();

    expressserver.listen(process.env.PORT || 4000, () => {
        applogger.log(`Listening at ${process.env.PORT||4000}`);
    });
    expressserver.use(cors({
        origin: getCorsOrigins(),
        credentials: true
    }));

    expressserver.use(cookieParser());

    apolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [AResolver, AccountResolver, LogInResolver, PersonResolver, PermissionsManagerResolver, OrganisationResolver, GroupResolver]
        }),
        context: async ({ req, res }) => {
            
            const encryptedtoken = req.cookies[AUTHORISATION];

            let token :AppToken;
            try {
                token = jwt.verify(encryptedtoken as string, tokenSecret) as AppToken;
                
                token.userID;
            } catch(err) {
                token = new AppToken();
            }

            return {
                req,
                res,
                token,
            }
        }
    });

    apolloserver.applyMiddleware({ app: expressserver, cors: false });
}

const testMain = async () => {
    applogger = new Logger("app/server", new LoggingManager());

    // database = await createConnection();
    // await seedDatabase();

    initTokenGeneration();

    expressserver.listen(process.env.PORT || 4000, () => {
        applogger.log(`Listening at ${process.env.PORT||4000}`);
    });
    expressserver.use(cors({
        origin: getCorsOrigins(),
        credentials: true
    }));

    expressserver.use(cookieParser());

    apolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [AResolver, AccountResolver, LogInResolver, PersonResolver, PermissionsManagerResolver, OrganisationResolver, GroupResolver]
        }),
        context: async ({ req, res }) => {
            
            const encryptedtoken = req.cookies[AUTHORISATION];

            let token :AppToken;
            try {
                token = jwt.verify(encryptedtoken as string, tokenSecret) as AppToken;
                
                token.userID;
            } catch(err) {
                token = new AppToken();
            }

            return {
                req,
                res,
                token,
            }
        }
    });

    apolloserver.applyMiddleware({ app: expressserver, cors: false });

    process.exit(0);
}

@Resolver()
class AResolver {
    @Query(() => String)
    ping() {
        return "pong!";
    }
}

process.env.TEST_MODE?.trim() === 'true' ? testMain() : main();