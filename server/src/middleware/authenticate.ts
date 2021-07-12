import { AuthenticationError } from "apollo-server-express";
import { Account } from "../entity/Account";
import { AppContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const Authenticate :MiddlewareFn<AppContext> = async ({ context }, next) => {

    if (!context.token.userID) 
        throw new AuthenticationError(`Not authenticated`);

    const account = await Account.findOne(context.token.userID, { relations: [`person`, `permissionsManager`] });

    if (!account) 
        throw new AuthenticationError(`Account not found`);

    context.account = account;
    return next();
}