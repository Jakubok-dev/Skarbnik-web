import { Person } from "../entity/Person";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver,  UseMiddleware } from "type-graphql";
import { database } from "../app";
import { Authenticate } from "../middleware/authenticate";
import { UserInputError } from "apollo-server-express";
import { Organisation } from "../entity/Organisation";
import { AppContext } from "../types";
import { Permission } from "../permissions/Permission";
import { AuthorisationError } from "src/error/AuthorisationError";

@InputType()
class PersonInput {
    @Field()
    name :string;
    @Field()
    surname :string;
    @Field({nullable: true})
    dateOfBirth ?:string;
    @Field()
    organisation :string;
}

@InputType()
class PersonUpdateInput {
    @Field()
    id :string;
    @Field({nullable: true})
    name ?:string;
    @Field({nullable: true})
    surname ?:string;
    @Field({nullable: true})
    dateOfBirth ?:string;
}

@Resolver(Person)
export class PersonResolver {
    
    @UseMiddleware(Authenticate)
    @Query(() => [Person])
    async people(
        @Ctx() { account } :AppContext
    ) {
        if (account!.permissionsManager.hasPermission(Permission.SEE_EVERYONES_DATA))
            return await database.getRepository(Person).find();

        if (account!.permissionsManager.hasPermission(Permission.SEE_PEOPLES_IN_THE_SAME_ORGANISATION_DATA)) {
            const organisation = await database.getRepository(Organisation).findOne(await account?.person?.organisation);

            if (!organisation)
                throw new UserInputError(`Objects not found`);

            return await organisation.people;
        }

        if (account!.permissionsManager.hasPermission(Permission.SEE_GROUPMATES_DATA)) {
            return await (await account?.group)?.people;
        }

        if (account!.permissionsManager.hasPermission(Permission.SEE_OWN_DATA))
            return [account?.person];

        throw new AuthorisationError();
    }

    @UseMiddleware(Authenticate)
    @Query(() => Person)
    async person(
        @Arg("id") id :string,
        @Ctx() { account } :AppContext
    ) {
        const person = await database.getRepository(Person).findOne(id);
        if (!person)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });
        
        if (account!.permissionsManager.hasPermission(Permission.SEE_EVERYONES_DATA))
            return person;

        if (account!.permissionsManager.hasPermission(Permission.SEE_PEOPLES_IN_THE_SAME_ORGANISATION_DATA)) {
            
            if ((await person.organisation).id !== (await account!.person.organisation).id)
                throw new AuthorisationError();
            
            return person;
        }

        if (account!.permissionsManager.hasPermission(Permission.SEE_GROUPMATES_DATA)) {

            if ((await (await account!.group!).people).filter(el => el.id === person.id).length === 0)
                throw new AuthorisationError();

            return person;
        }

        if (account!.permissionsManager.hasPermission(Permission.SEE_OWN_DATA)) {
            if (account?.person.id !== person.id)
                throw new AuthorisationError();

            return person;
        }

        throw new AuthorisationError();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Person)
    async addPerson(
        @Arg("person") personInput :PersonInput,
        @Ctx() { account } :AppContext
    ) {

        let dateOfBirth;
        if (personInput.dateOfBirth) {
            dateOfBirth = new Date(personInput.dateOfBirth);
            if (isNaN(dateOfBirth.getTime()))
                throw new UserInputError(`Invalid date`, {
                    argumentName: "person.dateOfBirth"
                });
        }

        const organisation = await database.getRepository(Organisation).findOne(personInput.organisation);
        if (!organisation) {
            throw new UserInputError(`Object not found`, {
                argumentName: "person.organisation"
            });
        }

        const person = Person.create({ 
            name: personInput.name,
            surname: personInput.surname,
            dateOfBirth: dateOfBirth,
        });
        person.organisation = organisation.toPromise()

        if (account!.permissionsManager.hasPermission(Permission.CREATE_EVERYONES_SERVERE_DATA)) {}

        else if (
            account!.permissionsManager.hasPermission(Permission.CREATE_PEOPLES_IN_THE_SAME_ORGANISATION_SERVERE_DATA) 
            && organisation!.id !== (await account!.person.organisation).id
        )
            throw new AuthorisationError();
        
        else if (account!.permissionsManager.hasPermission(Permission.CREATE_GROUPMATES_SERVERE_DATA)) {
            person.groups = Person.toPromise([]);
            if (!account?.group)
                throw new UserInputError(`You are not belonging to any group`);
            
            (await person.groups).push(await account.group);
        }

        else 
            throw new AuthorisationError();
        
        return await person.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Person)
    async updatePerson(
        @Arg("person") update :PersonUpdateInput,
        @Ctx() { account } :AppContext
    ) {
        const person = await database.getRepository(Person).findOne(update.id);
        if (!person) 
            throw new UserInputError(`Object not found`, {
                argumentName: `person.id`
            });

        if (account!.permissionsManager.hasPermission(Permission.UPDATE_EVERYONES_SERVERE_DATA)) {}
        else if (
            account!.permissionsManager.hasPermission(Permission.UPDATE_PEOPLES_IN_THE_SAME_ORGANISATION_SERVERE_DATA) 
            && 
            (await person.organisation).id !== (await account!.person.organisation).id
        )
            throw new AuthorisationError();
        else if (
            account!.permissionsManager.hasPermission(Permission.UPDATE_GROUPMATES_SERVERE_DATA)
            && 
            (await person.groups).filter(async el => el.id === (await account?.group)?.id).length === 0
        )
            throw new AuthorisationError();
        else if (
            account!.permissionsManager.hasPermission(Permission.UPDATE_OWN_SERVERE_DATA)
            &&
            person.id !== account?.person.id
        )
            throw new AuthorisationError();
        else
            throw new AuthorisationError();
        
        
        if (update.name)
            person.name = update.name;
        if (update.surname)
            person.surname = update.surname;
        if (update.dateOfBirth) {
            const dateOfBirth = new Date(update.dateOfBirth);
            if (isNaN(dateOfBirth.getTime()))
                throw new UserInputError(`Invalid date`, {
                    argumentName: "person.dateOfBirth"
                });
            person.dateOfBirth = dateOfBirth;
        }
        return await person.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async deletePerson(
        @Arg("id") id :string,
        @Ctx() { account } :AppContext
    ) {
        const person = await database.getRepository(Person).findOne(id);
        if (!person)
            return false;

        if (account!.permissionsManager.hasPermission(Permission.REMOVE_EVERYONES_SERVERE_DATA)) {}
        else if (
            account!.permissionsManager.hasPermission(Permission.REMOVE_PEOPLES_IN_THE_SAME_ORGANISATION_SERVERE_DATA) 
            && 
            (await person.organisation).id !== (await account!.person.organisation).id
        )
            throw new AuthorisationError();
        else if (
            account!.permissionsManager.hasPermission(Permission.REMOVE_GROUPMATES_SERVERE_DATA)
            && 
            (await person.groups).filter(async el => el.id === (await account?.group)?.id).length === 0
        )
            throw new AuthorisationError();
        else if (
            account!.permissionsManager.hasPermission(Permission.REMOVE_OWN_SERVERE_DATA)
            &&
            person.id !== account?.person.id
        )
            throw new AuthorisationError();
        else
            throw new AuthorisationError();

        await person.beforeRemove();
        await person.remove();

        return true;
    }
}