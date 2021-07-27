import { Authenticate } from "../middleware/authenticate";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Organisation } from "../entity/Organisation";
import { database } from "../app";
import { UserInputError } from "apollo-server-express";
import { Account } from "../entity/Account";
import { AuthorisationError } from "../error/AuthorisationError";
import { AuthorisationPack, CreateServereDataPack, RemoveServereDataPack, SeeDataPack, UpdateServereDataPack } from "../permissions/AuthorisationPacks";
import { AppContext } from "../types";
import { Permission } from "../permissions/Permission";

@InputType()
class OrganisationInput {
    @Field()
    name :string;
    @Field({ nullable: true })
    description ?:string;
}

@InputType()
class OrganisationUpdateInput {
    @Field()
    id :string;
    @Field({ nullable: true })
    name ?:string;
    @Field({ nullable: true })
    description ?:string;
}

const organisationAuthorisation = async (
    account :Account,
    organisation :Organisation,
    authorisationPack :AuthorisationPack
) => {

    if (account.permissionsManager.hasPermission(authorisationPack.everyone))
        return authorisationPack.everyone;
    
    if (
        account.permissionsManager.hasPermission(authorisationPack.organisation)
        &&
        organisation?.id === (await account.person.organisation).id
    )
        return authorisationPack.organisation;

    return false;
}

@Resolver(Organisation)
export class OrganisationResolver {

    @UseMiddleware(Authenticate)
    @Query(() => [Organisation])
    async organisations(
        @Ctx() { account } :AppContext,
    ) {

        if (account?.permissionsManager.hasPermission(Permission.SEE_EVERYONES_DATA))
            return await database.getRepository(Organisation).find();
        
        if (account?.permissionsManager.hasPermission(Permission.SEE_PEOPLES_IN_THE_SAME_ORGANISATION_DATA))
            return await database.getRepository(Organisation).find({ where: { id: (await account.person.organisation).id } });

        throw new AuthorisationError();
    }

    @UseMiddleware(Authenticate)
    @Query(() => Organisation)
    async organisation(
        @Arg(`id`) ID :string,
        @Ctx() { account } :AppContext,
    ) {
        const organisation = await database.getRepository(Organisation).findOne(ID);

        if (!organisation)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });

        if (await organisationAuthorisation(account!, organisation, new SeeDataPack()) === false)
            throw new AuthorisationError()

        return organisation;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Organisation)
    async addOrganisation(
        @Arg(`organisation`) organisationInput :OrganisationInput,
        @Ctx() { account } :AppContext,
    ) {
        const organisation = await Organisation.create({
            name: organisationInput.name,
            description: organisationInput.description
        });

        if (await organisationAuthorisation(account!, organisation, new CreateServereDataPack()) === false)
            throw new AuthorisationError()

        return await organisation.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Organisation)
    async updateOrganisation(
        @Arg(`organisation`) update :OrganisationUpdateInput,
        @Ctx() { account } :AppContext,
    ) {
        const organisation = await database.getRepository(Organisation).findOne(update.id);

        if (!organisation)
            throw new UserInputError(`Object not found`, {
                argumentName: "organisation.id"
            });

        if (update.name) 
            organisation.name = update.name;
        if (update.description)
            organisation.description = update.description;

        if (await organisationAuthorisation(account!, organisation, new UpdateServereDataPack()) === false)
            throw new AuthorisationError()

        return await organisation.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async removeOrganisation(
        @Arg(`id`) ID :string,
        @Ctx() { account } :AppContext,
    ) {
        const organisation = await database.getRepository(Organisation).findOne(ID);

        if (!organisation)
            return false;

        if (await organisationAuthorisation(account!, organisation, new RemoveServereDataPack()))
            throw new AuthorisationError()
        
        await organisation.beforeRemove();
        await organisation.remove();

        return true;
    }
}