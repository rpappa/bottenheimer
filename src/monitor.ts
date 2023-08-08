import { getShowtimes, getSeats, setTheatre } from './amc.js';
import CONFIG from './config.js';
import fs from 'fs';
import moment from 'moment-timezone';
import { tweetShowtimes } from './twitter.js';

const delay = async (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

// For debugging
// function simplifyObject(obj: any) {
//     // simplifies an object, whenever there is an array, it will only take the first element

//     const newObj: any = {};
//     for (const key in obj) {
//         if (Array.isArray(obj[key])) {
//             newObj[key] = [simplifyObject(obj[key][0])];
//         } else if (typeof obj[key] === 'object') {
//             newObj[key] = simplifyObject(obj[key]);
//         } else {
//             newObj[key] = obj[key];
//         }
//     }

//     return newObj;
// }

export type Showtime = {
    time: Date;
    id: number;
    link: string;
};

async function fetchShowtimes(date: string) {
    // This is super ugly
    const { session } = await setTheatre();
    const response = await getShowtimes(date, session);

    const movies = response.data.viewer?.user?.movies?.items;

    if (!movies) {
        throw new Error('No movies found');
    }

    const foundMovie = movies.find((m) => m?.movie?.slug === CONFIG.MOVIE_SLUG);

    if (!foundMovie) {
        throw new Error('Movie not found');
    }

    const { theatres } = foundMovie;

    if (!theatres) {
        throw new Error('No theatres found');
    }

    const foundTheatre = theatres.find((t) => t?.theatre?.slug === CONFIG.THEATRE_SLUG);

    if (!foundTheatre) {
        throw new Error('Theatre not found');
    }

    const formats = foundTheatre.formats?.items;

    if (!formats) {
        throw new Error('No formats found');
    }

    const foundFormat = formats.find((f) => f?.attributes && f.attributes.some((a) => a?.code === CONFIG.FORMAT_CODE));

    if (!foundFormat) {
        throw new Error('Format not found');
    }

    const showtimeEdges = foundFormat.groups?.edges;

    if (!showtimeEdges) {
        throw new Error('No showtimes found');
    }

    const showTimes = showtimeEdges.map((e) => e?.node?.showtimes?.edges).flat();

    if (!showTimes) {
        throw new Error('No showtimes found');
    }

    const output = showTimes.map((s) => ({
        time: new Date(s?.node?.when as string),
        id: s?.node?.showtimeId ?? 0,
        link: `https://www.amctheatres.com/movies/${CONFIG.MOVIE_SLUG}/showtimes/${CONFIG.MOVIE_SLUG}/${date}/${
            CONFIG.THEATRE_SLUG
        }/all/${s?.node?.showtimeId ?? ''}`,
    }));

    return output;
}

async function fetchSeats(showtimeId: number) {
    const tix = await getSeats(showtimeId);

    const seats = tix.data.viewer?.showtime?.seatingLayout?.seats;

    if (!seats) {
        throw new Error('No seats found');
    }

    return seats;
}

async function fetchAllShowtimes() {
    const startDate = moment().subtract(5, 'h').startOf('day');
    const endDate = moment().tz('America/New_York').add(1, 'month').startOf('day');

    const dates = [];
    for (let date = startDate; date.isBefore(endDate); date.add(1, 'day')) {
        dates.push(date.format('YYYY-MM-DD'));
    }

    const results = await Promise.all(
        dates.map(async (d) =>
            delay(Math.random() * 10_000).then(async () =>
                fetchShowtimes(d).catch((e) => {
                    console.error(e);
                    return [];
                })
            )
        )
    );

    return results
        .filter((r) => r.length > 0)
        .flat()
        .filter((r): r is Showtime => Boolean(r) && Boolean(r.id));
}

async function findGoodSeats(showtimeId: number) {
    const seats = await fetchSeats(showtimeId);

    // Find the number of seats in each row
    const seatsByRow: { [rowNum: number]: number } = {};
    for (const seat of seats) {
        const row = seat?.row;

        if (row) {
            seatsByRow[row] = (seatsByRow[row] ?? 0) + 1;
        }
    }

    const validSeats = seats.filter(
        (s) => s?.available && s?.type && s.type.toLowerCase() !== 'wheelchair' && s.type.toLowerCase() !== 'companion'
    );

    const isGoodSeat = (seat: (typeof validSeats)[0]) => {
        // Must be in row 5 or greater and in the middle 2/3 of the row
        // This is to keep tweet spam down
        if (!seat?.row || !seat?.column) {
            return false;
        }

        const { row, column } = seat;

        if (row <= 4) {
            return false;
        }

        const seatsInRow = seatsByRow[row];
        if (!seatsInRow) {
            return false;
        }

        // Must be in the middle 2/3 of the row
        const lowerBound = seatsInRow / 3;
        const upperBound = (seatsInRow * 2) / 3;

        return column >= lowerBound && column <= upperBound;
    };

    const goodSeats = validSeats.filter(isGoodSeat);

    return goodSeats;
}

export type GoodSeats = Awaited<ReturnType<typeof findGoodSeats>>;

function describeBlocks(seats: GoodSeats) {
    // Return eligible block descriptions, e.g. if there are 3 seats in a row, return [1,2,3]
    // if there are 2 seats in a row, return [1,2], etc

    // extract seats by rows
    const rows: { [rowNum: number]: GoodSeats } = {};

    for (const seat of seats) {
        if (!seat?.column || !seat?.row) {
            continue;
        }

        const theRow = rows[seat.row];

        if (theRow) {
            theRow.push(seat);
        } else {
            rows[seat.row] = [seat];
        }
    }

    const blockDescriptions = new Set<number>();

    for (const rowNum in rows) {
        const row = rows[rowNum];
        if (!row) {
            continue;
        }

        // Sort by column
        row.sort((a, b) => (a?.column ?? 0) - (b?.column ?? 0));

        // Find blocks
        let blockStart = 0;
        let blockEnd = 0;
        for (let i = 0; i < row.length; i++) {
            const seat = row[i];
            if (seat?.column === undefined || seat.column === null) {
                continue;
            }

            if (i === 0) {
                blockStart = seat.column;
                blockEnd = seat.column;
            } else if (seat.column === blockEnd + 1) {
                blockEnd = seat.column;
            } else {
                blockDescriptions.add(blockEnd - blockStart + 1);
                // Also add smaller blocks
                for (let j = blockStart; j < blockEnd; j++) {
                    blockDescriptions.add(j - blockStart + 1);
                }

                blockStart = seat.column;
                blockEnd = seat.column;
            }
        }

        // Add the last block
        blockDescriptions.add(blockEnd - blockStart + 1);
        // Also add smaller blocks
        for (let j = blockStart; j < blockEnd; j++) {
            blockDescriptions.add(j - blockStart + 1);
        }
    }

    return [...blockDescriptions].sort((a, b) => a - b);
}

async function checkForNewSeats(showtimeId: number, seen: Set<string>) {
    const goodSeats = await findGoodSeats(showtimeId);

    const newSeats = goodSeats.filter((s) => !seen.has(s?.name ?? ''));

    for (const seat of newSeats) {
        seen.add(seat?.name ?? '');
    }

    for (const seat of seen) {
        if (!goodSeats.some((s) => s?.name === seat)) {
            seen.delete(seat);
        }
    }

    return newSeats;
}

async function monitorLoop(showtime: Showtime) {
    const seenSet = new Set<string>();

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const newSeats = await checkForNewSeats(showtime.id, seenSet);

            const blocks = describeBlocks(newSeats);

            if (newSeats.length > 0) {
                console.log(
                    'New seats found!',
                    showtime.time,
                    newSeats.length,
                    newSeats.map((s) => s?.name ?? 'no name'),
                    blocks,
                    `In ${moment(showtime.time).fromNow()}`,
                    showtime.link
                );

                tweetShowtimes(showtime, newSeats, blocks).catch((e) => {
                    console.error(e);
                });
            }
        } catch (e) {
            // Do nothing
            console.error(`error for`, showtime.id, showtime.time);
        }

        // eslint-disable-next-line no-await-in-loop
        await delay(60_000 + Math.random() * 30_000);
    }
}

async function main() {
    const showtimes = await fetchAllShowtimes();
    console.log(`Monitoring ${showtimes.length} showtimes`);

    for (const showTime of showtimes) {
        // eslint-disable-next-line no-await-in-loop
        await delay(Math.random() * 3_000);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        monitorLoop(showTime);
    }
}

await main();
