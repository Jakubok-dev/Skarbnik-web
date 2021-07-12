import { PermissionsManager } from "../entity/PermissionsManager";
import { Permission } from "../permissions/Permission";
import { Arg, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { getPermissionGroup, PermissionGroupInstanceCreatable } from "../permissions/getPermissionGroup";
import { database } from "../app";
import { Account } from "../entity/Account";
import { UserInputError } from "apollo-server-express";
import { Authenticate } from "../middleware/authenticate";

@Resolver(PermissionsManager)
export class PermissionsManagerResolver {
    
    @UseMiddleware(Authenticate)
    @FieldResolver(() => [String])
    permissions(
        @Root() manager :PermissionsManager
    ) {
        return manager.permissions.map(el => Permission[el]);
    }

    @UseMiddleware(Authenticate)
    @Query(() => [Boolean])
    hasPermissions(
        @Root() manager :PermissionsManager,
        @Arg("permissions", () => [String]) permission :string[]
    ) {
        const parsedPermissions :Permission[] = permission.map(el => Permission[el as keyof typeof Permission]);

        return parsedPermissions.map(el => manager.hasPermission(el));
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => [Boolean])
    async addPermissions(
        @Arg(`account`) accountID :string,
        @Arg("permissions", () => [String]) permission :string[]
    ) {
        const account = await database.getRepository(Account).findOne(accountID, { relations: [ `permissionsManager` ] });

        if (!account)
            throw new UserInputError(`Object not found`, {
                argumentName: "account"
            });

        const parsedPermissions :Permission[] = permission.map(el => Permission[el as keyof typeof Permission]);

        const result = parsedPermissions.map(el => {
            if (!el)
                return false;
            return account.permissionsManager.addPermission(el);
        });
        account.save();
        return result;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => [Boolean])
    async removePermissions(
        @Arg(`account`) accountID :string,
        @Arg("permissions", () => [String]) permission :string[]
    ) {
        const account = await database.getRepository(Account).findOne(accountID, { relations: [ `permissionsManager` ] });

        if (!account)
            throw new UserInputError(`Object not found`, {
                argumentName: "account"
            });

        const parsedPermissions :Permission[] = permission.map(el => Permission[el as keyof typeof Permission]);

        const result = parsedPermissions.map(el => {
            if (!el)
                return false;
            return account.permissionsManager.removePermission(el);
        });
        account.save();
        return result;
    }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async setPermissionGroup(
        @Arg(`account`) accountID :string,
        @Arg(`permissionGroup`) permissionGroup :string
    ) {
        if (getPermissionGroup(permissionGroup) instanceof PermissionGroupInstanceCreatable)
            throw new UserInputError(`Invalid permission group`, {
                argumentName: "permissionGroup"
            });

        const account = await database.getRepository(Account).findOne(accountID, { relations: [`permissionsManager`] });

        if (!account)
            throw new UserInputError(`Object not found`, {
                argumentName: "account"
            });
        if (account.permissionsManager.permissionGroupType === permissionGroup)
            return false;
        
        account.permissionsManager.permissionGroup = getPermissionGroup(permissionGroup);
        account.save();
        return true;
    }
}