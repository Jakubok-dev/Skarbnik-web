import { gql } from "apollo-angular";

export const ORGANISATIONS_COUNT = gql`
    query organisationsCount($contains: String = "") {
        organisationsCount(contains: $contains)
    }
`