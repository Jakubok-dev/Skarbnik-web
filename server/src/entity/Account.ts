import { Arg, Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import bcrypt from "bcryptjs";
import { Person } from "./Person";
import { AppBaseEntity } from "./AppBaseEntity";
import { PermissionsManager } from "./PermissionsManager";
import { Group } from "./Group";

@ObjectType()
@Entity()
export class Account extends AppBaseEntity {
    
    @Field()
    @Column("text")
    username :string;

    @Column("text")
    password :string;

    @Field(() => Boolean, {description: "Checks is password the same as the given parameter"})
    async isPasswordValid(
        @Arg(`password`) psswd :string
    ) {
        return await bcrypt.compare(psswd, this.password);
    }

    @Field({nullable: true})
    @Column("text", {nullable: true, unique: true})
    email ?:string;

    @Field({nullable: true})
    @ManyToOne(() => Person, person => person.accounts, {
        cascade: [`insert`, `recover`, `update`],
        eager: true
    })
    person :Person;

    @Field({nullable: true})
    @OneToOne(() => PermissionsManager, manager => manager.account, {
        cascade: true,
        eager: true
    })
    permissionsManager :PermissionsManager;

    @Field({nullable: true})
    @ManyToOne(() => Group, group => group.accounts, {
        cascade: true,
        lazy: true
    })
    group ?:Promise<Group>;

    async beforeRemove() {
        await this.permissionsManager.remove();
    }
}