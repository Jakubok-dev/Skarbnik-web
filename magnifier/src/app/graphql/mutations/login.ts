import { gql } from "apollo-angular";

export const LOG_IN = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            id
            createdAt
            updatedAt
            username
            email
            person {
                id
                createdAt
                updatedAt
                name
                surname
                dateOfBirth
                age
            }
            permissionsManager {
                id
                createdAt
                updatedAt
                permissions
                _permissionGroupType
            }
            group {
                id
                createdAt
                updatedAt
                name
                description
            }
        }
    }
`