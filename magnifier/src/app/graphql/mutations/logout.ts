import { gql } from "apollo-angular";

export const LOG_OUT = gql`
    mutation {
        logout
    }
`