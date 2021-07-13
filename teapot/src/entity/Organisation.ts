import { Field, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { AppBaseEntity } from "./AppBaseEntity";
import { Group } from "./Group";
import { Person } from "./Person";

@ObjectType()
@Entity()
export class Organisation extends AppBaseEntity {

    @Field()
    @Column(`text`, { unique: true })
    name :string;

    @Field({nullable: true})
    @Column(`text`, { nullable: true })
    description ?:string;

    @Field(() => [Group], {nullable: true})
    @OneToMany(() => Group, group => group.organisation, {
        cascade: true,
        lazy: true
    })
    groups :Promise<Group[]>;

    @Field(() => [Person], {nullable: true})
    @OneToMany(() => Person, person => person.organisation, {
        cascade: true,
        lazy: true
    })
    people :Promise<Person[]>;

    async beforeRemove() {

        for (const item of await this.people) {
            await item.beforeRemove();
            await item.remove();
        }

        for (const item of await this.groups) {
            await item.beforeRemove();
            await item.remove();
        }
    }
}