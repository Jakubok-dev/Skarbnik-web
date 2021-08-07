import { gql } from "apollo-angular";

export const ORGANISATIONS_NAMES = gql`
    query organisationsNames($alphabetical: Boolean = true, $contains :String = "", $cursor: Int = 0, $limit: Int) {
        organisations(alphabetical: $alphabetical, contains: $contains, cursor: $cursor, limit: $limit) {
            id
            name
            description
            createdAt
            updatedAt
        }
    }
`