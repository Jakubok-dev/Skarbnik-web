import { gql } from "@apollo/client";

export const ME = gql`
    query me {
        me {
            id,
            username,
            email,
            person {
                id,
                name,
                surname,
                dateOfBirth,
                age
            }
        }
    }
`;