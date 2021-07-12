import { Authenticate } from "../middleware/authenticate";
import { Arg, Field, ID, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Organisation } from "../entity/Organisation";
import { database } from "../app";
import { UserInputError } from "apollo-server-express";

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

@Resolver(Organisation)
export class OrganisationResolver {

    @UseMiddleware(Authenticate)
    @Query(() => [Organisation])
    async organisations() {
        return await database.getRepository(Organisation).find();
    }

    @UseMiddleware(Authenticate)
    @Query(() => Organisation)
    async organisation(
        @Arg(`id`) ID :string
    ) {
        const organisation =  await database.getRepository(Organisation).findOne(ID);

        if (!organisation)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });

        return organisation;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Organisation)
    async addOrganisation(
        @Arg(`organisation`) organisationInput :OrganisationInput
    ) {
        const organisation = await Organisation.create({
            name: organisationInput.name,
            description: organisationInput.description
        });
        return await organisation.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Organisation)
    async updateOrganisation(
        @Arg(`organisation`) update :OrganisationUpdateInput
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

        return await organisation.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async removeOrganisation(
        @Arg(`id`) ID :string
    ) {
        const organisation = await database.getRepository(Organisation).findOne(ID);

        if (!organisation)
            return false;
        
        await organisation.beforeRemove();
        await organisation.remove();

        return true;
    }
}