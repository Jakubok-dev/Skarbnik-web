import { AppToken } from "./token";
import { Request, Response } from "express";
import { Account } from "./entity/Account";

export type AppContext = {
    req :Request,
    res :Response,
    token :AppToken,
    account ?:Account
}