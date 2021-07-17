import { Account } from "./account";
import { BaseType } from "./baseType";

export class PermissionsManager extends BaseType {

    permissions ?:string[];

    account ?:Account;

    _permissionGroupType ?:string;
}