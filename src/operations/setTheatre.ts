import { print } from 'graphql';
import { gql } from 'graphql-tag';

const SET_THEATRE = gql`
    mutation setTheatre($input: UserLocationInput!) {
        userSetLocation(input: $input) {
            user {
                selectedTheatre {
                    id
                    theatreId
                    __typename
                }
                __typename
            }
            __typename
        }
    }
`;

export default print(SET_THEATRE);
