import { gql } from "apollo-angular";

export const ME = gql`
    {
        me {
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