import { print } from 'graphql';
import { graphql } from '../generated-gql/gql.js';

/*
{
    "theatreSlug": "amc-lincoln-square-13",
    "movieSlug": "oppenheimer-66956",
    "premiumOption": "",
    "allMoviesSelected": false,
    "date": "2023-07-31"
}
*/

const SHOWTIMES_CONTAINER = graphql(`
    query ShowtimesContainer(
        $theatreSlug: String
        $movieSlug: String!
        $date: Date
        $premiumOption: String
        $allMoviesSelected: Boolean!
    ) {
        viewer {
            user {
                selectedTheatre {
                    id
                    slug
                    theatreId
                    name
                    attributes(first: 100) {
                        id
                        edges {
                            id
                            node {
                                id
                                code
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            ...Showtimes
            __typename
        }
    }

    fragment Showtimes on Viewer {
        movie(slug: $movieSlug) @skip(if: $allMoviesSelected) {
            id
            ...Filters_Movie
            ...ShowtimesResultsByMovie_Movie
            __typename
        }
        user {
            movies(date: $date, movieSlug: $movieSlug, theatreSlug: $theatreSlug, attribute: $premiumOption) {
                error {
                    id
                    ...ShowtimesResultsByMovie_ErrorInfo @skip(if: $allMoviesSelected)
                    ...ShowtimesResultsByTheatre_ErrorInfo @include(if: $allMoviesSelected)
                    __typename
                }
                items {
                    id
                    movie {
                        id
                        name
                        slug
                        __typename
                    }
                    theatres {
                        id
                        formats {
                            id
                            items {
                                id
                                attributes {
                                    id
                                    code
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                        ...ShowtimesResultsByMovie_ShowtimeTheatres @skip(if: $allMoviesSelected)
                        __typename
                    }
                    ...ShowtimesResultsByTheatre_ShowtimeMovie @include(if: $allMoviesSelected)
                    __typename
                }
                ...Filters_Movies
                __typename
            }
            allMovies: movies(date: $date) {
                items {
                    movie {
                        ...Filters_allMovies
                        __typename
                    }
                    __typename
                }
                __typename
            }
            ...RemindMeButton_User
            __typename
        }
        ...Filters_Viewer
        __typename
    }

    fragment Filters_allMovies on Movie {
        ...MovieFilter_Movies
        __typename
    }

    fragment MovieFilter_Movies on Movie {
        id
        name
        slug
        __typename
    }

    fragment Filters_Movies on ShowtimeMovies {
        ...PremiumFilter_Movies
        __typename
    }

    fragment PremiumFilter_Movies on ShowtimeMovies {
        filterableAttributes(type: PREMIUM_FILTERS, first: 15) {
            id
            edges {
                id
                node {
                    id
                    name
                    code
                    sort
                    details {
                        id
                        sort
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment Filters_Movie on Movie {
        ...MovieFilter_Movie
        __typename
    }

    fragment MovieFilter_Movie on Movie {
        name
        slug
        __typename
    }

    fragment Filters_Viewer on Viewer {
        selectableDates {
            id
            ...DateFilter_SelectableDates
            __typename
        }
        user {
            selectedTheatre {
                ...TheatreFilter_Theatre
                __typename
            }
            theatres(first: 10) {
                ...TheatreFilter_Theatres
                __typename
            }
            __typename
        }
        __typename
    }

    fragment DateFilter_SelectableDates on SelectableDates {
        dates
        selected
        __typename
    }

    fragment TheatreFilter_Theatre on Theatre {
        id
        distance
        marketName
        marketSlug
        name
        slug
        __typename
    }

    fragment TheatreFilter_Theatres on TheatreConnection {
        id
        count
        edges {
            id
            node {
                id
                distance
                marketName
                marketSlug
                name
                slug
                __typename
            }
            __typename
        }
        __typename
    }

    fragment RemindMeButton_User on User {
        id
        account {
            id
            emailAddress
            mobilePhoneNumber
            __typename
        }
        subscriptions {
            id
            hasSubscriptionEmail: hasSubscription(name: "stubs-mymovies", channel: "email")
            __typename
        }
        __typename
    }

    fragment ShowtimesResultsByMovie_ErrorInfo on ErrorInfo {
        ...NoShowtimesText_ErrorInfo
        __typename
    }

    fragment NoShowtimesText_ErrorInfo on ErrorInfo {
        message
        __typename
    }

    fragment ShowtimesResultsByMovie_Movie on Movie {
        name
        image(contentType: HeroDesktopDynamic) {
            id
            url
            __typename
        }
        isPrivateRental
        ...ShowtimesInfo_Movie
        ...MovieTitleHeader_Movie
        ...BlurredMovieBackground_Movie
        ...NoShowtimesText_Movie
        ...ShowtimesFormats_Movie
        __typename
    }

    fragment BlurredMovieBackground_Movie on Movie {
        hero: image(contentType: HeroDesktopDynamic) {
            id
            url
            __typename
        }
        poster: preferredPoster {
            id
            url
            __typename
        }
        __typename
    }

    fragment MovieTitleHeader_Movie on Movie {
        id
        mpaaRating
        name
        runTime
        websiteUrl
        attributes {
            id
            edges {
                id
                node {
                    id
                    code
                    name
                    details {
                        id
                        premiumOffering
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        hero: image(contentType: HeroDesktopDynamic) {
            id
            url
            __typename
        }
        poster: preferredPoster {
            id
            url
            __typename
        }
        __typename
    }

    fragment NoShowtimesText_Movie on Movie {
        slug
        __typename
    }

    fragment ShowtimesInfo_Movie on Movie {
        name
        synopsisTagLine
        shortSynopsis
        synopsis
        websiteUrl
        runTime
        mpaaRating
        ratings {
            ...MovieRatings_Ratings
            __typename
        }
        ...RemindMeButton_Movie
        ...ShowtimesTrailer_Movie
        __typename
    }

    fragment MovieRatings_Ratings on MovieRatings {
        rottenTomatoes {
            audienceRatingImageUrl
            audienceScore
            criticsRatingImageUrl
            criticsScore
            movieUrl
            __typename
        }
        __typename
    }

    fragment RemindMeButton_Movie on IMovie {
        id
        accountMovieDetails {
            id
            __typename
        }
        movieId
        name
        status
        __typename
    }

    fragment ShowtimesTrailer_Movie on Movie {
        name
        hero: image(contentType: HeroDesktopDynamic) {
            id
            url
            __typename
        }
        movieStill: image(contentType: MovieStillDynamic) {
            id
            url
            __typename
        }
        video: preferredTrailer {
            id
            externalId
            videoStillImageUrl
            __typename
        }
        __typename
    }

    fragment ShowtimesFormats_Movie on Movie {
        canPrequeue
        __typename
    }

    fragment ShowtimesResultsByMovie_ShowtimeTheatres on ShowtimeTheatre {
        id
        theatre {
            ...ShowtimesFormats_Theatre
            id
            name
            slug
            distance
            websiteUrl
            __typename
        }
        formats {
            id
            items {
                id
                ...ShowtimesFormats_Formats
                __typename
            }
            __typename
        }
        __typename
    }

    fragment ShowtimesFormats_Formats on ShowtimeMovieFormat {
        attributes {
            id
            abbreviation
            code
            shortDescription
            description
            sort
            details {
                id
                sort
                __typename
            }
            images(first: 1, contentType: IconDynamic) {
                id
                count
                edges {
                    id
                    node {
                        id
                        url
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        groups(first: 15) {
            id
            edges {
                id
                node {
                    id
                    attributes(first: 100) {
                        id
                        edges {
                            id
                            node {
                                id
                                name
                                abbreviation
                                code
                                description
                                ...ShowtimeLink_Attribute
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    showtimes(first: 100) {
                        id
                        edges {
                            id
                            node {
                                id
                                isDiscountMatineePriced
                                discountMatineeMessage
                                maximumIntendedAttendance
                                showtimeId
                                status
                                display {
                                    id
                                    time
                                    amPm
                                    __typename
                                }
                                ...ShowtimeLink_Showtime
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment ShowtimeLink_Attribute on Attribute {
        id
        code
        name
        description
        __typename
    }

    fragment ShowtimeLink_Showtime on Showtime {
        id
        status
        when
        attributes {
            id
            edges {
                id
                node {
                    id
                    code
                    name
                    description
                    __typename
                }
                __typename
            }
            __typename
        }
        movie {
            id
            canPrequeue
            name
            runTime
            __typename
        }
        __typename
    }

    fragment ShowtimesFormats_Theatre on Theatre {
        id
        theatreId
        attributes(first: 100) {
            id
            edges {
                id
                node {
                    id
                    ...ShowtimeLink_Attribute
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment ShowtimesResultsByTheatre_ErrorInfo on ErrorInfo {
        ...NoShowtimesText_ErrorInfo
        __typename
    }

    fragment ShowtimesResultsByTheatre_ShowtimeMovie on ShowtimeMovie {
        movie {
            id
            name
            image(contentType: HeroDesktopDynamic) {
                id
                url
                __typename
            }
            ...BlurredMovieBackground_Movie
            ...MovieTitleHeader_Movie
            ...ShowtimesInfo_Movie
            ...ShowtimesFormats_Movie
            __typename
        }
        theatres {
            id
            theatre {
                ...ShowtimesFormats_Theatre
                id
                name
                __typename
            }
            formats {
                id
                items {
                    id
                    ...ShowtimesFormats_Formats
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }
`);

export default print(SHOWTIMES_CONTAINER);
