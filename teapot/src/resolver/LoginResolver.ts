import { database } from "../app";
import { Account } from "../entity/Account";
import { AppContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { AppToken, tokenSecret } from "../token";
import jwt from "jsonwebtoken";
import { AUTHORISATION } from "../global";

@Resolver()
export class LogInResolver {

    @Mutation(() => Account, { nullable: true })
    async login(
        @Ctx() { res } :AppContext,
        @Arg("username") username :string,
        @Arg("password") password :string
    ) {
        const user = await database.getRepository(Account).findOne({ where: { username } });
        if (!user)
            return undefined;

        if (await user.isPasswordValid(password)) {

            const token = new AppToken();
            token.userID = user.id;

            res.cookie(AUTHORISATION, jwt.sign(JSON.stringify(token), tokenSecret), { expires: new Date(Date.now() + 1000 * 60 * 60 * 24) /* A day */ });
            return user;
            
        }
        return undefined;
    }

    @Mutation(() => Boolean)
    async logout(
        @Ctx() { req, res } :AppContext,
    ) {
        if (!req.cookies[AUTHORISATION])
            return false;
        res.clearCookie(AUTHORISATION);
        return true;
    }

    @Query(() => Account, {nullable: true})
    async me(
        @Ctx() { token } :AppContext
    ) {
        if (!token.userID)
            return undefined;
        const user = await database.getRepository(Account).findOne(token.userID);
        return user;
    }
}