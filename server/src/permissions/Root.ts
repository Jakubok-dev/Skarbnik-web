import { Permission } from "./Permission";
import { PermissionGroup } from "./PermissionGroup";

class Root extends PermissionGroup {
    readonly priority :number = 0;
    readonly type :string = `root`;

    constructor() {
        super();
        this._permissions = [
            Permission.SEE_EVERYONES_DATA,
            Permission.CREATE_EVERYONES_SERVERE_DATA,
            Permission.UPDATE_EVERYONES_SERVERE_DATA,
            Permission.REMOVE_EVERYONES_SERVERE_DATA,
            Permission.ADVANCE_TO_THE_SAME_LEVEL_WHICH_IS_ADVISOR,
            Permission.DISADVANCE_FROM_THE_SAME_LEVEL_WHICH_IS_DISADVISOR
        ];
    }
}

export const ROOT = new Root();