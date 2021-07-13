import { Permission } from "../permissions/Permission";
import { getPermissionGroup } from "../permissions/getPermissionGroup";
import { PermissionGroup } from "../permissions/PermissionGroup"
import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Account } from "./Account";
import { AppBaseEntity } from "./AppBaseEntity";

@ObjectType()
@Entity()
export class PermissionsManager extends AppBaseEntity {

    @Column({
        type: "enum",
        enum: Permission,
        array: true
    })
    private _permissions :Permission[] = [];

    @Field(() => [String])
    get permissions() {
        return this._permissions;
    }

    @Field(() => Account, {nullable: true})
    @OneToOne(() => Account, account => account.permissionsManager, {
        cascade: [`insert`, `recover`, `update`],
        lazy: true
    })
    @JoinColumn()
    account :Promise<Account>;

    @Field({nullable: true})
    @Column({nullable: true})
    private _permissionGroupType ?:string;
    get permissionGroupType() {
        return this._permissionGroupType;
    }


    set permissionGroup(value :PermissionGroup) {
        this._permissionGroupType = value.type;
    }
    get permissionGroup() {
        return getPermissionGroup(this._permissionGroupType);
    }


    addPermission(permission :Permission) {
        if (this._permissions.filter(el => el === permission).length > 0)
            return false;

        this._permissions.push(permission);

        return true;
    }

    removePermission(permission :Permission) {
        const perm = this._permissions.filter(el => el === permission)[0];
        if (perm) {
            this._permissions.splice(this._permissions.indexOf(perm));
            return true;
        }

        return false;
    }

    hasPermission(permission ?:Permission) {
        if (this._permissions.filter(el => el === permission).length === 0)
            return this.permissionGroup.has(permission);
        return true;
    }
}