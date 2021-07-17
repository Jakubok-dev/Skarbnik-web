import { Account } from "./account";
import { BaseType } from "./baseType";
import { Group } from "./group";
import { Organisation } from "./organisation";

export class Person extends BaseType {

    name ?:string;

    surname ?:string;

    dateOfBirth ?:Date;

    age ?:number;

    accounts ?:Account[];

    organisation ?:Organisation;

    groups ?:Group[];
}