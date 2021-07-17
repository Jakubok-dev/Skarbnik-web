import { BaseType } from "./baseType";
import { Group } from "./group";
import { PermissionsManager } from "./permissionsManager";
import { Person } from "./person";

export class Account extends BaseType {
    
    username ?:string;

    password ?:string;

    isPasswordValid ?:boolean;

    email ?:string;

    person ?:Person;

    permissionsManager ?:PermissionsManager;

    group ?:Group;
}