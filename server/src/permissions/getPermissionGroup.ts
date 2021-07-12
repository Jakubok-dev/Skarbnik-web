import { ROOT } from "./Root";
import { PermissionGroup } from "./PermissionGroup";

export class PermissionGroupInstanceCreatable extends PermissionGroup {
    readonly priority: number = Infinity; readonly type :string = `undefined` 
}

export const getPermissionGroup = (type ?:string):PermissionGroup => {
    switch(type) {
        case `root`:
            return ROOT;
        default:
            return new PermissionGroupInstanceCreatable();
    }
}