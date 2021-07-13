import { Field, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@ObjectType({ description: `Basic class which every type inherit` })
export class AppBaseEntity extends BaseEntity {

    @Field()
    @PrimaryColumn()
    id :string;

    @BeforeInsert()
    genID() {
        this.id = uuidv4();
    }

    @Field(() => String)
    @CreateDateColumn()
    createdAt :Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt :Date;

    toPromise() {
        return Promise.resolve(this);
    }

    static toPromise(value :any) {
        return Promise.resolve(value);
    }
}