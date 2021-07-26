import { ApolloError } from "@apollo/client";

export class AuthorisationError extends ApolloError {
    constructor() {
        super({
            errorMessage: `403 Forbidden access`
        });
    }
}