import { database } from "../app";
import { Account } from "../entity/Account";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { UserInputError } from "apollo-server-express";
import bcrypt from "bcryptjs";
import { Authenticate } from "../middleware/authenticate";
import { Person } from "../entity/Person";
import { PermissionsManager } from "../entity/PermissionsManager";
import { AuthorisationPack, CreateServereDataPack, RemoveServereDataPack, SeeDataPack, UpdateServereDataPack } from "../permissions/AuthorisationPacks";
import { AuthorisationError } from "../error/AuthorisationError";
import { AppContext } from "../types";
import { Permission } from "../permissions/Permission";

@InputType()
class AccountInput {
    @Field()
    username :string;
    @Field()
    password :string;
    @Field({nullable: true})
    email ?:string;
    @Field({nullable: true})
    personID ?:string;
}

@InputType()
class AccountUpdateInput {
    @Field()
    id :string;
    @Field({nullable: true})
    username ?:string;
    @Field({nullable: true})
    password ?:string;
    @Field({nullable: true})
    email ?:string;
    @Field({nullable: true})
    personID ?:string;
}

const authorise = async (
    invoker :Account,
    account :Account,
    authorisationPack :AuthorisationPack,
) => {

    if (invoker.permissionsManager.hasPermission(authorisationPack.everyone))
        return authorisationPack.everyone;

    if (
        invoker.permissionsManager.hasPermission(authorisationPack.organisation)
        &&
        (await account?.person.organisation).id === (await invoker?.person.organisation).id
    )
        return authorisationPack.organisation;
    else if (invoker.permissionsManager.hasPermission(authorisationPack.organisation))
        throw new AuthorisationError();

    if (
        invoker.permissionsManager.hasPermission(authorisationPack.group)
        &&
        (await account.group)?.id === (await invoker?.group)?.id
    )
        return authorisationPack.group;
    else if (invoker.permissionsManager.hasPermission(authorisationPack.group))
        throw new AuthorisationError();

    if (
        invoker.permissionsManager.hasPermission(authorisationPack.own)
        &&
        invoker.id === account.id
    )
        return authorisationPack.own;
    else if (invoker.permissionsManager.hasPermission(authorisationPack.own))
        throw new AuthorisationError();

    throw new AuthorisationError();
}

@Resolver(Account)
export class AccountResolver {

    @UseMiddleware(Authenticate)
    @Query(() => Account)
    async account(
        @Arg("id") ID :string,
        @Ctx() { account: loggedAccount } :AppContext,
    ) {
        const account = await database.getRepository(Account).findOne(ID);
        if (!account)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });

        authorise(loggedAccount!, account, new SeeDataPack());

        return account;
    }

    @UseMiddleware(Authenticate)
    @Query(() => [Account])
    async accounts(
        @Ctx() { account } :AppContext,
    ) {

        if (account?.permissionsManager.hasPermission(Permission.SEE_EVERYONES_DATA))
            return await database.getRepository(Account).find();
        
        if (account?.permissionsManager.hasPermission(Permission.SEE_PEOPLES_IN_THE_SAME_ORGANISATION_DATA)) {
            const people = await database.getRepository(Account).find();

            people.filter(async el => (await el?.person.organisation).id === (await account?.person.organisation).id);

            return people;
        }

        if (account?.permissionsManager.hasPermission(Permission.SEE_GROUPMATES_DATA)) {
            const people = await database.getRepository(Account).find();

            people.filter(async el => (await el?.group)?.id === (await account?.group)?.id);

            return people;
        }

        if (account?.permissionsManager.hasPermission(Permission.SEE_OWN_DATA))
            return await database.getRepository(Account).findOne(account.id);

        throw new AuthorisationError();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Account)
    async addAccount(
        @Arg("account") accountInput :AccountInput,
        @Ctx() { account: loggedAccount } :AppContext,
    ) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(accountInput.password, salt);

        let person :Person | undefined;
        if (accountInput.personID) {
            person = await database.getRepository(Person).findOne(accountInput.personID);
            if (!person)
            throw new UserInputError(`Object not found`, {
                argumentName: "account.personID"
            });                
        }

        const account = Account.create({
            username: accountInput.username,
            password: hash,
            email: accountInput.email,
            person: person,
            permissionsManager: PermissionsManager.create()
        });

        account.permissionsManager.account = account.toPromise();

        authorise(loggedAccount!, account, new CreateServereDataPack());
        
        return await database.getRepository(Account).save(account);
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Account)
    async updateAccount(
        @Arg("account") update :AccountUpdateInput,
        @Ctx() { account: loggedAccount } :AppContext,
    ) {
        const account = await database.getRepository(Account).findOne(update.id);
        if (!account)
            throw new UserInputError(`Object not found`, {
                argumentName: "account.id"
            });
        
        if (update.username) {
            account.username = update.username;
        }
        if (update.password) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(update.password, salt);
            account.password = hash;
        }
        if (update.email)
            account.email = update.email;
        if (update.personID) {
            const person = await database.getRepository(Person).findOne(update.personID);
            if (!person)
            throw new UserInputError(`Object not found`, {
                argumentName: "account.personID"
            });
            account.person = person;
        }

        authorise(loggedAccount!, account, new UpdateServereDataPack());
    
        return await account.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async deleteAccount(
        @Arg("id") ID :string,
        @Ctx() { account: loggedAccount } :AppContext,
    ) {
        const account = await database.getRepository(Account).findOne(ID);
        if (!account)
            return false;

        authorise(loggedAccount!, account, new RemoveServereDataPack());

        await account.beforeRemove();
        await account.remove();
        
        return true;
    }
}