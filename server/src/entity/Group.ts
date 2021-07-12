import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Account } from "./Account";
import { AppBaseEntity } from "./AppBaseEntity";
import { Organisation } from "./Organisation";
import { Person } from "./Person";

@ObjectType()
@Entity()
export class Group extends AppBaseEntity {

    @Field()
    @Column()
    name :string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    description ?:string;

    @Field(() => Organisation, { nullable: true })
    @ManyToOne(() => Organisation, organisation => organisation.groups, {
        cascade: [`insert`, `recover`, `update`],
        lazy: true
    })
    organisation :Promise<Organisation>;

    @Field(() => [Person], { nullable: true })
    @ManyToMany(() => Person, person => person.groups, {
        cascade: [`insert`, `recover`, `update`],
        lazy: true
    })
    @JoinTable()
    people :Promise<Person[]>;

    @Field(() => [Account], { nullable: true })
    @OneToMany(() => Account, account => account.group, {
        cascade: [`update`, `insert`, `update`],
        lazy: true
    })
    accounts :Promise<Account[]>;

    async beforeRemove() {
        this.people = Group.toPromise([]);
        (await this.accounts).forEach(async el => {
            await el.beforeRemove();
            await el.remove();
        });
    }
}