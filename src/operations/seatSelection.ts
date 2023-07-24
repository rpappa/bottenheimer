import { gql } from 'graphql-tag';
import { print } from 'graphql';

const SeatSelection = gql`
    query SeatSelection($showtimeId: Int!, $token: String, $hasToken: Boolean!) {
        viewer {
            id
            showtime(id: $showtimeId) {
                id
                isReservedSeating
                isPrivateRental
                maximumIntendedAttendance
                showDateTimeUtc
                error {
                    id
                    message
                    __typename
                }
                movie {
                    id
                    name
                    movieId
                    slug
                    __typename
                }
                theatre {
                    id
                    slug
                    name
                    brand
                    ...CovidMessaging_Theatre
                    __typename
                }
                ...SeatTypeSelection_Showtime
                ...SeatSelection_Showtime
                ...UtilsGoogleTagManager_Showtime
                ...FriendSelection_Showtime
                ...PrivateShowingMovieSelection_Showtime
                __typename
            }
            user {
                id
                account {
                    id
                    accountId
                    friendCount: friends {
                        id
                        items(status: CONFIRMED) {
                            id
                            count
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
                ...SeatTypeSelection_User
                ...FriendSelection_User
                ...SeatSelection_User
                __typename
            }
            order(token: $token) @include(if: $hasToken) {
                id
                ...SeatTypeSelection_Order
                __typename
            }
            __typename
        }
    }

    fragment CovidMessaging_Theatre on Theatre {
        id
        attributes {
            id
            ...attributeExists_AttributeConnection
            __typename
        }
        __typename
    }

    fragment attributeExists_AttributeConnection on AttributeConnection {
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

    fragment SeatSelection_Showtime on Showtime {
        id
        attributes(first: 10) {
            id
            ...MovieTitleHeader_Attributes
            __typename
        }
        display {
            id
            ...MovieTitleHeader_DateTimeDisplay
            __typename
        }
        movie {
            id
            ...MovieTitleHeader_Movie
            __typename
        }
        theatre {
            id
            ...MovieTitleHeader_Theatre
            __typename
        }
        ...SocialSharing_Showtime
        ...SeatingCheckout_Showtime
        __typename
    }

    fragment MovieTitleHeader_Attributes on AttributeConnection {
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

    fragment MovieTitleHeader_DateTimeDisplay on DateTimeDisplay {
        id
        prefix
        date
        time
        dateShort
        amPm
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

    fragment MovieTitleHeader_Theatre on Theatre {
        id
        name
        __typename
    }

    fragment SeatingCheckout_Showtime on Showtime {
        id
        showtimeId
        attributes(first: 10) {
            id
            ...MovieTitleHeader_Attributes
            __typename
        }
        allAttributes: attributes {
            ...attributeExists_AttributeConnection
            __typename
        }
        display {
            id
            ...MovieTitleHeader_DateTimeDisplay
            __typename
        }
        movie {
            id
            ...MovieTitleHeader_Movie
            __typename
        }
        theatre {
            id
            ...MovieTitleHeader_Theatre
            __typename
        }
        ...Auditorium_Showtime
        __typename
    }

    fragment Auditorium_Showtime on Showtime {
        id
        attributes(first: 10) {
            ...Screen_Attributes
            __typename
        }
        seatingLayout {
            id
            columns
            error {
                ...ErrorMessage_ErrorInfo
                __typename
            }
            ...Layout_SeatingLayout
            ...Legend_SeatingLayout
            __typename
        }
        __typename
    }

    fragment ErrorMessage_ErrorInfo on ErrorInfo {
        id
        message
        __typename
    }

    fragment Screen_Attributes on AttributeConnection {
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

    fragment Layout_SeatingLayout on SeatingLayout {
        id
        rows
        seats {
            id
            available
            column
            row
            shouldDisplay
            type
            ...Seat_Seat
            __typename
        }
        __typename
    }

    fragment Seat_Seat on Seat {
        id
        available
        column
        row
        name
        type
        seatTier
        shouldDisplay
        zone {
            id
            name
            type
            surchargeAmount
            discountAmount
            __typename
        }
        __typename
    }

    fragment Legend_SeatingLayout on SeatingLayout {
        id
        seats {
            id
            available
            seatTier
            shouldDisplay
            seatStatus
            type
            __typename
        }
        zones {
            id
            type
            name
            order
            surchargeAmount
            discountAmount
            __typename
        }
        __typename
    }

    fragment SocialSharing_Showtime on Showtime {
        id
        when
        shareShowtime {
            id
            url
            __typename
        }
        movie {
            id
            name
            movieStillDynamic: image(contentType: MovieStillDynamic) {
                id
                url
                __typename
            }
            heroDesktopDynamic: image(contentType: HeroDesktopDynamic) {
                id
                url
                __typename
            }
            __typename
        }
        theatre {
            id
            name
            __typename
        }
        __typename
    }

    fragment SeatSelection_User on User {
        id
        ...SeatingCheckout_User
        __typename
    }

    fragment SeatingCheckout_User on User {
        id
        ...Auditorium_User
        __typename
    }

    fragment Auditorium_User on User {
        id
        ...Legend_User
        ...Layout_User
        __typename
    }

    fragment Legend_User on User {
        id
        account {
            id
            hasAlistSubscription: hasProductSubscription(subscriptionType: A_LIST)
            __typename
        }
        ...ZoneTooltipModal_User
        __typename
    }

    fragment ZoneTooltipModal_User on User {
        account {
            id
            hasAlistSubscription: hasProductSubscription(subscriptionType: A_LIST)
            __typename
        }
        selectedTheatre {
            id
            productSubscriptions(subscriptionType: A_LIST) {
                id
                items {
                    id
                    cost
                    productAttributes {
                        id
                        usageTier {
                            id
                            value
                            __typename
                        }
                        movieFilmWeekCap {
                            id
                            value
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

    fragment Layout_User on User {
        id
        ...Seat_User
        __typename
    }

    fragment Seat_User on User {
        id
        account {
            id
            hasAlistSubscription: hasProductSubscription(subscriptionType: A_LIST)
            __typename
        }
        __typename
    }

    fragment PrivateShowingMovieSelection_Showtime on Showtime {
        display {
            id
            ...MovieTitleHeader_DateTimeDisplay
            __typename
        }
        movie {
            id
            ...MovieTitleHeader_Movie
            __typename
        }
        privateShowingMovies {
            id
            movieName
            internalReleaseNumber
            sku
            price {
                id
                USD
                __typename
            }
            movie {
                id
                movieId
                genre
                mpaaRating
                name
                runTime
                image(contentType: PosterDynamic) {
                    id
                    url
                    __typename
                }
                ...MovieTitleHeader_Movie
                __typename
            }
            __typename
        }
        theatre {
            id
            ...MovieTitleHeader_Theatre
            __typename
        }
        movieTitleHeaderAttributes: attributes(first: 10) {
            id
            ...MovieTitleHeader_Attributes
            __typename
        }
        __typename
    }

    fragment SeatTypeSelection_Showtime on Showtime {
        id
        isPrivateRental
        maximumIntendedAttendance
        showtimeId
        ...AgeRestrictionNotice_Showtime
        ...CheckoutNotifications_Showtime
        ...DiscountMatineeDisclaimer_Showtime
        ...ProductSubscriptionOption_Showtime
        ...SeatSelectionDetails_Showtime
        allAttributes: attributes {
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
        prices {
            id
            price: priceWithoutTax
            type
            sku
            agePolicy
            __typename
        }
        productSubscriptionDiscountEligibility {
            id
            isEligible
            __typename
        }
        movieTitleHeaderAttributes: attributes(first: 10) {
            id
            ...MovieTitleHeader_Attributes
            __typename
        }
        display {
            id
            ...MovieTitleHeader_DateTimeDisplay
            __typename
        }
        movie {
            id
            ...MovieTitleHeader_Movie
            __typename
        }
        theatre {
            id
            ...MovieTitleHeader_Theatre
            ...ConcessionQuickAdd_Theatre
            __typename
        }
        when
        __typename
    }

    fragment AgeRestrictionNotice_Showtime on Showtime {
        ...AgePolicyCopy_Showtime
        __typename
    }

    fragment AgePolicyCopy_Showtime on Showtime {
        id
        display {
            id
            time
            amPm
            __typename
        }
        movie {
            id
            mpaaRating
            __typename
        }
        __typename
    }

    fragment CheckoutNotifications_Showtime on Showtime {
        id
        showtimeId
        notifications {
            id
            messages {
                id
                notificationId
                __typename
            }
            ...TransactionNotification_TransactionNotifications
            __typename
        }
        __typename
    }

    fragment TransactionNotification_TransactionNotifications on TransactionNotifications {
        id
        messages {
            id
            href
            message
            notificationId
            __typename
        }
        __typename
    }

    fragment DiscountMatineeDisclaimer_Showtime on Showtime {
        id
        isDiscountMatineePriced
        discountMatineeMessage
        __typename
    }

    fragment ProductSubscriptionOption_Showtime on Showtime {
        productSubscriptionDiscountEligibility {
            id
            isEligible
            isOutOfTier
            __typename
        }
        display {
            id
            monthDayYearSingleDigit
            year
            __typename
        }
        __typename
    }

    fragment ConcessionQuickAdd_Theatre on Theatre {
        concession: concessionQuickAdd {
            id
            name
            price
            sku
            image(contentType: Product) {
                id
                url
                __typename
            }
            comboComponents {
                id
                concession {
                    sku
                    __typename
                }
                __typename
            }
            parentCategory {
                id
                name
                __typename
            }
            __typename
        }
        __typename
    }

    fragment SeatSelectionDetails_Showtime on Showtime {
        id
        isDiscountMatineePriced
        discountMatineeMessage
        isPrivateRental
        prices {
            id
            price: priceWithoutTax
            type
            sku
            agePolicy
            __typename
        }
        productSubscriptionDiscountEligibility {
            id
            isEligible
            isOutOfTier
            __typename
        }
        maximumIntendedAttendance
        __typename
    }

    fragment SeatTypeSelection_User on User {
        account {
            id
            accountId
            alistProductSubscription: productSubscription(subscriptionType: A_LIST) {
                id
                __typename
            }
            ...ProductSubscriptionOption_Account
            ...SeatSelectionDetails_Account
            __typename
        }
        ...CheckoutNotifications_User
        ...ZonedSeatingMessaging_User
        __typename
    }

    fragment ZonedSeatingMessaging_User on User {
        id
        account {
            id
            accountId
            hasAlistSubscription: hasProductSubscription(subscriptionType: A_LIST)
            __typename
        }
        __typename
    }

    fragment CheckoutNotifications_User on User {
        id
        globalNotificationsDismissed
        account {
            id
            notifications(type: PRODUCT_SUBSCRIPTION) {
                ...AccountNotification_AccountNotifications
                __typename
            }
            __typename
        }
        __typename
    }

    fragment AccountNotification_AccountNotifications on AccountNotification {
        id
        href
        message
        notificationId
        __typename
    }

    fragment ProductSubscriptionOption_Account on Account {
        alistSubscription: productSubscription(subscriptionType: A_LIST) {
            id
            ...ProductSubscriptionOption_AccountProductSubscription
            nextBillDate {
                id
                monthDayYearSingleDigit
                __typename
            }
            pendingTransfer {
                id
                alistSubscription: productSubscription(subscriptionType: A_LIST) {
                    id
                    ...ProductSubscriptionOption_AccountProductSubscription
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }

    fragment ProductSubscriptionOption_AccountProductSubscription on AccountProductSubscription {
        id
        counters {
            id
            outOfTierVisitsCap {
                id
                current
                max
                __typename
            }
            __typename
        }
        __typename
    }

    fragment SeatSelectionDetails_Account on Account {
        alistSubscription: productSubscription(subscriptionType: A_LIST) {
            id
            ...ProductSubscriptionPausedMessage_AccountProductSubscription
            __typename
        }
        __typename
    }

    fragment ProductSubscriptionPausedMessage_AccountProductSubscription on AccountProductSubscription {
        id
        pauseOptions {
            id
            canResume
            __typename
        }
        statusName
        __typename
    }

    fragment SeatTypeSelection_Order on Order {
        id
        ...ConcessionQuickAdd_Order
        __typename
    }

    fragment ConcessionQuickAdd_Order on Order {
        groups {
            id
            type
            items {
                id
                sku
                quantity
                tokens
                __typename
            }
            __typename
        }
        __typename
    }

    fragment FriendSelection_User on User {
        account {
            id
            accountId
            firstName
            lastName
            friends {
                id
                items {
                    id
                    edges {
                        id
                        node {
                            id
                            ...EligibleFriend_AccountFriend
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

    fragment EligibleFriend_AccountFriend on AccountFriend {
        id
        nickname
        firstName
        lastName
        friendGuid
        email
        favorite
        pending
        friendsSince {
            id
            dateShort
            __typename
        }
        __typename
    }

    fragment FriendSelection_Showtime on Showtime {
        productSubscriptionDiscountEligibility {
            id
            isEligible
            isOutOfTier
            error {
                id
                message
                __typename
            }
            __typename
        }
        __typename
    }

    fragment UtilsGoogleTagManager_Showtime on Showtime {
        id
        showtimeId
        error {
            id
            message
            __typename
        }
        movie {
            id
            name
            movieId
            __typename
        }
        theatre {
            id
            slug
            name
            theatreId
            __typename
        }
        __typename
    }
`;

const SEAT_SELECTION_QUERY = print(SeatSelection);
export default SEAT_SELECTION_QUERY;
