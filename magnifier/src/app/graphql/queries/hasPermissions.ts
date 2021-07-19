import { gql } from "apollo-angular";

export const HAS_PERMISSIONS = gql`
    query hasPermissions($permissions: [Permission!], $accountID: String) {
        hasPermissions(permissions: $permissions, accountID: $accountID)
    }
`