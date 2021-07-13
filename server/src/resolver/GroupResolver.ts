import { Group } from "../entity/Group";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Authenticate } from "../middleware/authenticate";
import { database } from "../app";
import { UserInputError } from "apollo-server-express";
import { Organisation } from "../entity/Organisation";
import { Person } from "../entity/Person";
import { Account } from "../entity/Account";
import { AuthorisationPack, CreateServereDataPack, RemoveServereDataPack, SeeDataPack, UpdateServereDataPack } from "../permissions/AuthorisationPacks";
import { AuthorisationError } from "../error/AuthorisationError";
import { AppContext } from "../types";
import { Permission } from "../permissions/Permission";
import { personAuthorisation } from "./PersonResolver";

@InputType()
class GroupInput {
    @Field()
    name :string;
    @Field({ nullable: true })
    description ?:string;
    @Field()
    organisationID :string;
}

@InputType()
class GroupUpdateInput {
    @Field()
    id :string;
    @Field({ nullable: true })
    name ?:string;
    @Field({ nullable: true })
    description ?:string;
    @Field(() => [String], { nullable: true })
    peopleIDs ?:string[];
}

const groupAuthorisation = async (
    account :Account,
    group :Group,
    authorisationPack :AuthorisationPack
) => {

    if (account.permissionsManager.hasPermission(authorisationPack.everyone))
        return authorisationPack.everyone;
    
    if (
        account.permissionsManager.hasPermission(authorisationPack.organisation)
        &&
        (await group.organisation).id === (await account.person.organisation).id
    )
        return authorisationPack.organisation;

    if (
        account.permissionsManager.hasPermission(authorisationPack.group)
        &&
        group.id === (await account?.group)?.id
    )
        return authorisationPack.group;

    throw new AuthorisationError();
}

@Resolver(Group)
export class GroupResolver {

    @UseMiddleware(Authenticate)
    @Query(() => [Group])
    async groups(
        @Ctx() { account } :AppContext,
    ) {

        if (account?.permissionsManager.hasPermission(Permission.SEE_EVERYONES_DATA))
            return await database.getRepository(Group).find();
        
        if (account?.permissionsManager.hasPermission(Permission.SEE_PEOPLES_IN_THE_SAME_ORGANISATION_DATA))
            return await database.getRepository(Group).find({ where: { organisation: account.person.organisation } });

        if (account?.permissionsManager.hasPermission(Permission.SEE_GROUPMATES_DATA))
            return await database.getRepository(Group).find({ where: { id: (await account.group)?.id } });

        throw new AuthorisationError();
    }

    @UseMiddleware(Authenticate)
    @Query(() => Group)
    async group(
        @Arg(`id`) ID :string,
        @Ctx() { account } :AppContext,
    ) {
        const group = await database.getRepository(Group).findOne(ID);

        if (!group)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });

        groupAuthorisation(account!, group, new SeeDataPack());

        return group;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Group)
    async addGroup(
        @Arg(`group`) groupInput :GroupInput,
        @Ctx() { account } :AppContext,
    ) {
        const organisation = await database.getRepository(Organisation).findOne(groupInput.organisationID);

        if (!organisation)
            throw new UserInputError(`Object not found`, {
                argumentName: "group.organisationID"
            });

        if ((await organisation.groups).filter(el => el.name === groupInput.name).length > 0)
            throw new UserInputError(`Name isn't unique`, {
                argumentName: "group.name"
            });

        const group = Group.create({
            name: groupInput.name,
            description: groupInput.description,
        });
        group.organisation = organisation.toPromise();

        groupAuthorisation(account!, group, new CreateServereDataPack());

        return await group.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Group)
    async updateGroup(
        @Arg(`group`) update :GroupUpdateInput,
        @Ctx() { account } :AppContext,
    ) {
        const group = await database.getRepository(Group).findOne(update.id);

        if (!group)
            throw new UserInputError(`Object not found`, {
                argumentName: "group.id"
            });

        if (update.name) {
            // group.organisation.groups.filter()
            if ((await (await group.organisation).groups).filter(el => el.name === update.name).length > 0)
                throw new UserInputError(`Name isn't unique`, {
                    argumentName: "group.name"
                });

            group.name = update.name;
        }
        if (update.description)
            group.description = update.description;
        if (update.peopleIDs) {
            for (const item of update.peopleIDs) {
                const person = await database.getRepository(Person).findOne(item);

                if (!person || (await person?.organisation).id !== (await group.organisation).id)
                    throw new UserInputError(`Object not found`, {
                        argumentName: `update.peopleIDs[${update.peopleIDs.indexOf(item)}]`
                    });

                if ((await group.people).filter(el => el.id === person.id).length === 0)
                    (await group.people).push(person);
            }
        }

        groupAuthorisation(account!, group, new UpdateServereDataPack());

        return await group.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async removeGroup(
        @Arg(`id`) ID :string,
        @Ctx() { account } :AppContext,
    ) {
        const group = await database.getRepository(Group).findOne(ID);

        if (!group)
            return false;

        groupAuthorisation(account!, group, new RemoveServereDataPack());

        await group.beforeRemove();
        await group.save();

        return true;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async addToGroup(
        @Arg(`person`) personID :string,
        @Arg(`group`) groupID :string,
        @Ctx() { account } :AppContext,
    ) {
        const person = await database.getRepository(Person).findOne(personID);
        if (!person)
            return false;
        
        const group = await database.getRepository(Group).findOne(groupID);
        if (!group)
            return false;

        if ((await person.groups).filter(el => el.id === group.id).length > 0)
            return false;

        groupAuthorisation(account!, group, new CreateServereDataPack());
        personAuthorisation(account!, person, new CreateServereDataPack());

        (await group.people).push(person);
        await group.save();
        
        return true;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async removeFromGroup(
        @Arg(`person`) personID :string,
        @Arg(`group`) groupID :string,
        @Ctx() { account } :AppContext,
    ) {
        const person = await database.getRepository(Person).findOne(personID);
        if (!person)
            return false;
        
        const group = await database.getRepository(Group).findOne(groupID);
        if (!group)
            return false;

        const personInGroup = (await group.people).filter(el => el.id === person.id)[0];
        if (!personInGroup)
            return false;

        groupAuthorisation(account!, group, new RemoveServereDataPack());
        personAuthorisation(account!, person, new RemoveServereDataPack());

        (await group.people).splice((await group.people).indexOf(personInGroup));
        await group.save();
        
        return true;
    }
}