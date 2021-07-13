import { Person } from "../entity/Person";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver,  UseMiddleware } from "type-graphql";
import { database } from "../app";
import { Authenticate } from "../middleware/authenticate";
import { UserInputError } from "apollo-server-express";
import { Organisation } from "../entity/Organisation";
import { AppContext } from "../types";
import { Permission } from "../permissions/Permission";
import { AuthorisationError } from "../error/AuthorisationError";
import { Account } from "../entity/Account";
import { AuthorisationPack, CreateServereDataPack, RemoveServereDataPack, SeeDataPack, UpdateServereDataPack } from "../permissions/AuthorisationPacks";
import { EVERYONE, GROUP, ORGANISATION, OWN } from "../global";

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



export const personAuthorisation = async (
    account :Account,
    person :Person,
    authorisationPack :AuthorisationPack,
) => {

    if (account!.permissionsManager.hasPermission(authorisationPack.everyone)) 
        return EVERYONE;

    if (
        account!.permissionsManager.hasPermission(authorisationPack.organisation) 
        && 
        (await person.organisation).id === (await account?.person.organisation).id
    )
        return ORGANISATION;

    if (
        account!.permissionsManager.hasPermission(authorisationPack.group)
        && 
        (await person.groups).filter(async el => el.id === (await account?.group)?.id).length > 0
    )
        return GROUP
    
    if (
        account!.permissionsManager.hasPermission(authorisationPack.own)
        &&
        person?.id === account?.person.id
    )
        return OWN;
    
    throw new AuthorisationError();
}

@Resolver(Person)
export class PersonResolver {
    
    @UseMiddleware(Authenticate)
    @Query(() => [Person])
    async people(
        @Ctx() { account } :AppContext,
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
        @Ctx() { account } :AppContext,
    ) {
        const person = await database.getRepository(Person).findOne(id);
        if (!person)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });
        
        personAuthorisation(account!, person, new SeeDataPack())

        return person;
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
        if (!organisation)
            throw new UserInputError(`Object not found`, {
                argumentName: "person.organisation"
            });

        const person = Person.create({ 
            name: personInput.name,
            surname: personInput.surname,
            dateOfBirth: dateOfBirth,
        });
        person.organisation = organisation.toPromise()

        personAuthorisation(account!, person, new CreateServereDataPack());
        
        return await person.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Person)
    async updatePerson(
        @Arg("person") update :PersonUpdateInput,
        @Ctx() { account } :AppContext,
    ) {
        const person = await database.getRepository(Person).findOne(update.id);
        if (!person) 
            throw new UserInputError(`Object not found`, {
                argumentName: `person.id`
            });

        personAuthorisation(account!, person, new UpdateServereDataPack());
        
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
        @Ctx() { account } :AppContext,
    ) {
        const person = await database.getRepository(Person).findOne(id);
        if (!person)
            return false;

        personAuthorisation(account!, person, new RemoveServereDataPack());

        await person.beforeRemove();
        await person.remove();

        return true;
    }
}