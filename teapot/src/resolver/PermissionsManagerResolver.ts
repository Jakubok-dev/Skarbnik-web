import { PermissionsManager } from "../entity/PermissionsManager";
import { Permission } from "../permissions/Permission";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { getPermissionGroup, PermissionGroupInstanceCreatable } from "../permissions/getPermissionGroup";
import { database } from "../app";
import { Account } from "../entity/Account";
import { UserInputError } from "apollo-server-express";
import { Authenticate } from "../middleware/authenticate";
import { accountAuthorisation } from "./AccountResolver";
import { AppContext } from "../types";
import { PermissionAuthorisationPack, SeeDataPack } from "../permissions/AuthorisationPacks";
import { AuthorisationError } from "../error/AuthorisationError";
import { PermissionGroup } from "../permissions/PermissionGroup";

const setPermissionGroupAuthorisation = (
    invoker :Account,
    account :Account,
    authorisationPack :PermissionAuthorisationPack,
    permissionGroupToSet :PermissionGroup
) => {
    if (
        invoker?.permissionsManager.hasPermission(authorisationPack.same)
        &&
        account.permissionsManager.permissionGroup > invoker.permissionsManager.permissionGroup
        ||
        invoker?.permissionsManager.hasPermission(authorisationPack.same)
        &&
        permissionGroupToSet > invoker.permissionsManager.permissionGroup
    )
        return false;
    if (invoker?.permissionsManager.hasPermission(authorisationPack.same))
        return authorisationPack.same;

    if (
        invoker?.permissionsManager.hasPermission(authorisationPack.lower)
        &&
        account.permissionsManager.permissionGroup >= invoker.permissionsManager.permissionGroup
        ||
        invoker?.permissionsManager.hasPermission(authorisationPack.lower)
        &&
        permissionGroupToSet >= invoker.permissionsManager.permissionGroup
    )
        return false;
    if (invoker?.permissionsManager.hasPermission(authorisationPack.lower))
        return authorisationPack.lower;

    return false;
}

@Resolver(PermissionsManager)
export class PermissionsManagerResolver {
    
    @UseMiddleware(Authenticate)
    @FieldResolver(() => [String])
    async permissions(
        @Root() manager :PermissionsManager,
        @Ctx() { account: loggedAccount } :AppContext,
    ) {
        if (await accountAuthorisation(loggedAccount!, await manager.account, new SeeDataPack()) === false)
            throw new AuthorisationError();
        return manager.permissions.map(el => Permission[el]);
    }

    @UseMiddleware(Authenticate)
    @Query(() => [Boolean])
    async hasPermissions(
        @Arg("permissions", () => [String]) permission :string[],
        @Ctx() { account: loggedAccount } :AppContext,
        @Arg("accountID", { nullable: true }) accountID ?:string,
    ) {
        if (!accountID)
            accountID = loggedAccount!.id;
        const account = await database.getRepository(Account).findOne(accountID);
        if (!account)
            throw new UserInputError(`Object not found`, {
                argumentName: "accountID"
            });

        if (await accountAuthorisation(loggedAccount!, account, new SeeDataPack()) === false)
            throw new AuthorisationError();

        const parsedPermissions :Permission[] = permission.map(el => Permission[el as keyof typeof Permission]);

        return parsedPermissions.map(el => account.permissionsManager.hasPermission(el));
    }

    // @UseMiddleware(Authenticate)
    // @Mutation(() => [Boolean])
    // async addPermissions(
    //     @Arg(`account`) accountID :string,
    //     @Arg("permissions", () => [String]) permission :string[],
    //     @Ctx() { account: loggedAccount } :AppContext,
    // ) {
    //     const account = await database.getRepository(Account).findOne(accountID, { relations: [ `permissionsManager` ] });

    //     if (!account)
    //         throw new UserInputError(`Object not found`, {
    //             argumentName: "account"
    //         });

    //     const parsedPermissions :Permission[] = permission.map(el => Permission[el as keyof typeof Permission]);

    //     const result = parsedPermissions.map(el => {
    //         if (!el)
    //             return false;
    //         return account.permissionsManager.addPermission(el);
    //     });
    //     account.save();
    //     return result;
    // }

    // @UseMiddleware(Authenticate)
    // @Mutation(() => [Boolean])
    // async removePermissions(
    //     @Arg(`account`) accountID :string,
    //     @Arg("permissions", () => [String]) permission :string[],
    //     @Ctx() { account: loggedAccount } :AppContext,
    // ) {
    //     const account = await database.getRepository(Account).findOne(accountID, { relations: [ `permissionsManager` ] });

    //     if (!account)
    //         throw new UserInputError(`Object not found`, {
    //             argumentName: "account"
    //         });

    //     const parsedPermissions :Permission[] = permission.map(el => Permission[el as keyof typeof Permission]);

    //     const result = parsedPermissions.map(el => {
    //         if (!el)
    //             return false;
    //         return account.permissionsManager.removePermission(el);
    //     });
    //     account.save();
    //     return result;
    // }

    @UseMiddleware(Authenticate)
    @Mutation(() => Boolean)
    async setPermissionGroup(
        @Arg(`account`) accountID :string,
        @Arg(`permissionGroup`) permissionGroup :string,
        @Ctx() { account: loggedAccount } :AppContext,
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
        
        if (!account.permissionsManager.permissionGroup || account.permissionsManager.permissionGroup < getPermissionGroup(permissionGroup))
            if (setPermissionGroupAuthorisation(
                loggedAccount!,
                account, 
                {
                    same: Permission.ADVANCE_TO_THE_SAME_LEVEL_WHICH_IS_ADVISOR, 
                    lower: Permission.ADVANCE_TO_THE_LOWER_LEVEL_WHICH_IS_ADVISOR 
                }, 
                getPermissionGroup(permissionGroup)
            ) === false)
                throw new AuthorisationError();
        else
            if (setPermissionGroupAuthorisation(
                loggedAccount!,
                account, 
                {
                    same: Permission.DISADVANCE_FROM_THE_SAME_LEVEL_WHICH_IS_DISADVISOR, 
                    lower: Permission.DISADVANCE_FROM_THE_LOWER_LEVEL_WHICH_IS_DISADVISOR 
                }, 
                getPermissionGroup(permissionGroup)
            ) === false)
                throw new AuthorisationError();
        
        account.permissionsManager.permissionGroup = getPermissionGroup(permissionGroup);
        account.save();
        return true;
    }
}