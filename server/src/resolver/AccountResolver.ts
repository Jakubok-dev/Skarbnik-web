import { database } from "../app";
import { Account } from "../entity/Account";
import { Arg, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { UserInputError } from "apollo-server-express";
import bcrypt from "bcryptjs";
import { Authenticate } from "../middleware/authenticate";
import { Person } from "../entity/Person";
import { PermissionsManager } from "../entity/PermissionsManager";

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

@Resolver(Account)
export class AccountResolver {

    @UseMiddleware(Authenticate)
    @Query(() => Account)
    async account(
        @Arg("id") ID :string
    ) {
        const account = await database.getRepository(Account).findOne(ID);
        if (!account)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });
        return account;
    }

    @UseMiddleware(Authenticate)
    @Query(() => [Account])
    async accounts() {
        return await database.getRepository(Account).find();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Account)
    async addAccount(
        @Arg("account") accountInput :AccountInput
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
        
        return await database.getRepository(Account).save(account);
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Account)
    async updateAccount(
        @Arg("account") update :AccountUpdateInput,
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
    
        return await account.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async deleteAccount(
        @Arg("id") ID :string
    ) {
        const account = await database.getRepository(Account).findOne(ID);
        if (!account)
            return false;

        await account.beforeRemove();
        await account.remove();
        
        return true;
    }
}