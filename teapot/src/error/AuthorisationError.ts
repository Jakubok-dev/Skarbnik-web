export class AuthorisationError extends Error {
    constructor() {
        super(`403 Forbidden access`);
    }
}