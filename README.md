# bottenheimer

Monitors for nuclear bomb movie seats. Low quality code--wrote this in less than 24 hours. Also was my first time doing
much reverse-engineering of a graphql backend, so I'm probably very sloppy with what I've done there.

## Usage

First, install all dependencies by running `npm install`.

#### Building

To generate TypeScript types for the GraphQL schema, run `npm run codegen`. This you only need to do once.

#### Running the monitoring service

To run the monitoring service, run `npm run monitor`. This will start the monitoring service without Twitter
integration. To start the monitoring service with Twitter integration, run `npm run monitor:twitter`.

#### Twitter environment variables

`TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` must be set.

#### Generating a Twitter bearer token

To generate a Twitter bearer token, run `npm run twitterauth`.

### Scripts:

-   `test`: Runs the test suite for the project. This script is currently not implemented and will exit with an error
    message.
-   `codegen`: Generates TypeScript types for the GraphQL schema using graphql-codegen. The configuration for this
    script is defined in `codegen.ts`.
-   `build`: Compiles the TypeScript code in the `src` directory and outputs the compiled JavaScript files to the `dist`
    directory.
-   `monitor`: Starts the monitoring service for the project.
-   `monitor:twitter`: Starts the monitoring service for the project with Twitter integration.
-   `twitterauth`: Runs the Twitter authentication script to generate a bearer token for the Twitter API.
