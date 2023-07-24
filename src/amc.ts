import defaultGot from 'got';
import { env, envStr } from '@rpappa/env';
import SHOWTIMES_CONTAINER from './operations/showtimesContainer.js';
import SET_THEATRE from './operations/setTheatre.js';
import {
    SetTheatreMutationVariables,
    ShowtimesContainerQuery,
    ShowtimesContainerQueryVariables,
    SeatSelectionQuery,
    SeatSelectionQueryVariables,
    UserLocationType,
} from './generated-gql/graphql.js';
import CONFIG from './config.js';

import tunnel from 'tunnel';
import SEAT_SELECTION from './operations/seatSelection.js';

const agent = tunnel.httpsOverHttp({
    proxy: {
        host: 'localhost',
        port: 8888,
    },
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const got = defaultGot.extend({
    prefixUrl: 'https://graph.amctheatres.com/',
    headers: {
        // it appears that we don't really need any of these headers
        // to be a good citizen, we'll set the user-agent to something that identifies us
        'user-agent': `bottenheimer/${envStr`npm_package_version`}`,
        // 'Accept-Language': 'en-US,en;q=0.9',
        // Connection: 'keep-alive',
        // Origin: 'https://www.amctheatres.com',
        // Referer: 'https://www.amctheatres.com/',
        // 'Sec-Fetch-Dest': 'empty',
        // 'Sec-Fetch-Mode': 'cors',
        // 'Sec-Fetch-Site': 'same-site',
        // 'User-Agent':
        //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        accept: '*/*',
        // 'content-type': 'application/json',
        // 'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        // 'sec-ch-ua-mobile': '?0',
        // 'sec-ch-ua-platform': '"macOS"',
        // 'x-amc-request-id': '9fc43de3-1e02-4664-9e77-b29681cc0753',
    },
    method: 'POST',
    responseType: 'json',
    throwHttpErrors: false,
    agent: {
        // @ts-expect-error something is wrong with the tunnel typings
        https: env`MITM` ? agent : undefined,
    },
});

// need to handle session from the connect.sid cookie, we'll use a functional approach to pass it around

type AMCSession = string;

async function gqlExecute<QueryType>(
    operation: string,
    variables: unknown,
    session: AMCSession | undefined
): Promise<{ data: QueryType; session?: AMCSession }> {
    const headers: { [header: string]: string } = {};
    if (session) {
        headers['cookie'] = `connect.sid=${session}`;
    }

    const response = await got<{ data: QueryType }>('graphql', {
        headers,
        json: { query: operation, variables },
        responseType: 'json',
        throwHttpErrors: false,
    });

    let newSession: AMCSession | undefined;
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
        for (const cookie of setCookieHeader) {
            const match = /connect\.sid=([^;]+)/.exec(cookie);
            if (match) {
                newSession = match[1];
                break;
            }
        }
    }

    // fall back to the old session if we didn't get a new one
    return { data: response.body.data, session: newSession ?? session };
}

export async function setTheatre(session?: AMCSession) {
    const operation = SET_THEATRE;
    const variables: SetTheatreMutationVariables = {
        input: {
            type: UserLocationType.Search,
            latitude: 45.75,
            longitude: -74,
            selectedTheatreId: CONFIG.THEATRE_ID,
        },
    };

    return gqlExecute(operation, variables, session);
}

/**
 *
 * @param date format is YYYY-MM-DD
 * @param session
 * @returns
 */
export async function getShowtimes(date: string, session?: AMCSession) {
    const operation = SHOWTIMES_CONTAINER;
    const variables: ShowtimesContainerQueryVariables = {
        allMoviesSelected: false,
        // format is YYYY-MM-DD
        date,
        movieSlug: CONFIG.MOVIE_SLUG,
        theatreSlug: CONFIG.THEATRE_SLUG,
        premiumOption: '',
    };

    return gqlExecute<ShowtimesContainerQuery>(operation, variables, session);
}

export async function getSeats(showtimeId: number, session?: AMCSession) {
    const operation = SEAT_SELECTION;
    const variables: SeatSelectionQueryVariables = {
        showtimeId,
        hasToken: false,
    };

    return gqlExecute<SeatSelectionQuery>(operation, variables, session);
}
