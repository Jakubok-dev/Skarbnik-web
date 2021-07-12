declare namespace NodeJS {
    export interface ProcessEnv {
        CORS_ORIGIN ?:string,
        CORS_ORIGIN_PORT :string,

        LOCALHOST_IS_CORS_ORIGIN :string,
        IS_LOCALHOST_HTTPS :string,

        LOCAL_IP_ADRESSES_ARE_CORS_ORIGINS :string,
        ARE_LOCAL_IP_ADRESSES_HTTPS :string,
        
        TOKEN_SECRET_MAX_AGE :string
    }
}