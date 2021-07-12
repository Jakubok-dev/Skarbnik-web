import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Account } from "./Account";
import { AppBaseEntity } from "./AppBaseEntity";
import { Group } from "./Group";
import { Organisation } from "./Organisation";

@ObjectType()
@Entity()
export class Person extends AppBaseEntity {

    @Field()
    @Column("text")
    name :string;

    @Field()
    @Column("text")
    surname :string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    dateOfBirth ?:Date;

    @Field(() => Int)
    age() {
        if (!this.dateOfBirth) 
            return -1;

        const now = new Date(Date.now());
        let age = now.getFullYear()-this.dateOfBirth.getFullYear();

        if (now.getMonth() < this.dateOfBirth.getMonth() || now.getMonth() === this.dateOfBirth.getMonth() && now.getDay() < this.dateOfBirth.getDay())
            age--;

        return age;
    }

    @Field(() => [Account], { nullable: true })
    @OneToMany(() => Account, account => account.person, {
        cascade: true,
        lazy: true
    })
    accounts :Promise<Account[]>;

    @Field(() => Organisation, { nullable: true })
    @ManyToOne(() => Organisation, group => group.people, {
        cascade: [`insert`, `recover`, `update`],
        lazy: true
    })
    organisation :Promise<Organisation>;

    @Field(() => [Group], { nullable: true })
    @ManyToMany(() => Group, group => group.people, {
        cascade: [`insert`, `update`, `recover`],
        lazy: true
    })
    groups :Promise<Group[]>;

    async beforeRemove() {
        for (const item of await this.accounts) {
            await item.beforeRemove();
            await item.remove();
        }

        for (const item of await this.groups) {
            item.people = Person.toPromise((await item.people).filter(el => el !== this));
            await item.save();
        }
    }
}