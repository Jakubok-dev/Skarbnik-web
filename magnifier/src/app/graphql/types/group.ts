import { Account } from "./account";
import { BaseType } from "./baseType";
import { Organisation } from "./organisation";
import { Person } from "./person";

export class Group extends BaseType {

    name ?:string;

    description ?:string;

    organisation ?:Organisation;

    people ?:Person[];
    
    accounts ?:Account[];
}