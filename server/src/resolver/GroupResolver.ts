import { Group } from "../entity/Group";
import { Arg, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Authenticate } from "../middleware/authenticate";
import { applogger, database } from "../app";
import { UserInputError } from "apollo-server-express";
import { Organisation } from "../entity/Organisation";
import { Person } from "../entity/Person";

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

@Resolver(Group)
export class GroupResolver {

    @UseMiddleware(Authenticate)
    @Query(() => [Group])
    async groups() {
        return await database.getRepository(Group).find();
    }

    @UseMiddleware(Authenticate)
    @Query(() => Group)
    async group(
        @Arg(`id`) ID :string
    ) {
        const group = await database.getRepository(Group).findOne(ID);

        if (!group)
            throw new UserInputError(`Object not found`, {
                argumentName: "id"
            });

        return group;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Group)
    async addGroup(
        @Arg(`group`) groupInput :GroupInput
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

        return await group.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Group)
    async updateGroup(
        @Arg(`group`) update :GroupUpdateInput
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

        return await group.save();
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async removeGroup(
        @Arg(`id`) ID :string
    ) {
        const group = await database.getRepository(Group).findOne(ID);

        if (!group)
            return false;

        await group.beforeRemove();
        await group.save();

        return true;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async addToGroup(
        @Arg(`person`) personID :string,
        @Arg(`group`) groupID :string
    ) {
        const person = await database.getRepository(Person).findOne(personID);
        if (!person)
            return false;
        
        const group = await database.getRepository(Group).findOne(groupID);
        if (!group)
            return false;

        if ((await person.groups).filter(el => el.id === group.id).length > 0)
            return false;

        (await group.people).push(person);
        await group.save();
        
        return true;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async removeFromGroup(
        @Arg(`person`) personID :string,
        @Arg(`group`) groupID :string
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

        (await group.people).splice((await group.people).indexOf(personInGroup));
        
        return true;
    }
}