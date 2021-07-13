import { ROOT } from "./Root";
import { Permission } from "./Permission";

export abstract class PermissionGroup {

    readonly abstract type :string;
    readonly abstract priority :number;

    protected _permissions :Permission[] = [];

    has(permission ?:Permission) {
        if (this._permissions.filter(el => el === permission).length > 0)
            return true;
        return false;
    }
}