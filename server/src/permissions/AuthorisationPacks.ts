import { Permission } from "./Permission";

export interface AuthorisationPack {
    own :Permission;
    group :Permission;
    organisation :Permission;
    everyone :Permission;
}

export class SeeDataPack implements AuthorisationPack {
    own: Permission = Permission.SEE_OWN_DATA;
    group: Permission = Permission.SEE_GROUPMATES_DATA;
    organisation: Permission = Permission.SEE_PEOPLES_IN_THE_SAME_ORGANISATION_DATA;
    everyone: Permission = Permission.SEE_EVERYONES_DATA;
}

export class CreateServereDataPack implements AuthorisationPack {
    own: Permission = Permission.CREATE_OWN_SERVERE_DATA;
    group: Permission = Permission.CREATE_GROUPMATES_SERVERE_DATA;
    organisation: Permission = Permission.CREATE_PEOPLES_IN_THE_SAME_ORGANISATION_SERVERE_DATA;
    everyone: Permission = Permission.CREATE_EVERYONES_SERVERE_DATA;
}

export class UpdateServereDataPack implements AuthorisationPack {
    own: Permission = Permission.UPDATE_OWN_SERVERE_DATA;
    group: Permission = Permission.UPDATE_GROUPMATES_SERVERE_DATA;
    organisation: Permission = Permission.UPDATE_PEOPLES_IN_THE_SAME_ORGANISATION_SERVERE_DATA;
    everyone: Permission = Permission.UPDATE_EVERYONES_SERVERE_DATA;
}

export class RemoveServereDataPack implements AuthorisationPack {
    own: Permission = Permission.REMOVE_OWN_SERVERE_DATA;
    group: Permission = Permission.REMOVE_GROUPMATES_SERVERE_DATA;
    organisation: Permission = Permission.REMOVE_PEOPLES_IN_THE_SAME_ORGANISATION_SERVERE_DATA;
    everyone: Permission = Permission.REMOVE_EVERYONES_SERVERE_DATA;
}

export type PermissionAuthorisationPack = {
    same :Permission.ADVANCE_TO_THE_SAME_LEVEL_WHICH_IS_ADVISOR | Permission.DISADVANCE_FROM_THE_SAME_LEVEL_WHICH_IS_DISADVISOR;
    lower :Permission.ADVANCE_TO_THE_LOWER_LEVEL_WHICH_IS_ADVISOR | Permission.DISADVANCE_FROM_THE_LOWER_LEVEL_WHICH_IS_DISADVISOR;
}