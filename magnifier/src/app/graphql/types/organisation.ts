import { BaseType } from "./baseType";
import { Group } from "./group";
import { Person } from "./person";

export class Organisation extends BaseType {

    name ?:string;

    description ?:string;

    groups ?:Group[];

    people ?:Person[];
}