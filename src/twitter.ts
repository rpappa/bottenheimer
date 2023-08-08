import { envStr } from '@rpappa/env';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';
import { type GoodSeats, type Showtime } from './monitor.js';
import moment from 'moment-timezone';
config();

let botClient: TwitterApi | undefined;

async function createClient() {
    if (botClient) {
        return botClient;
    }

    // Read .twitter.json
    const { refreshToken } = JSON.parse(fs.readFileSync('.twitter.json', 'utf-8')) as { refreshToken: string };

    // Instantiate with an app access token
    const appClient = new TwitterApi({
        clientId: envStr`TWITTER_CLIENT_ID`,
        clientSecret: envStr`TWITTER_CLIENT_SECRET`,
    });

    // Create bot client from existing auth tokens
    const {
        client: botClientRefreshed,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    } = await appClient.refreshOAuth2Token(refreshToken);

    // Save new tokens
    fs.writeFileSync('.twitter.json', JSON.stringify({ accessToken: newAccessToken, refreshToken: newRefreshToken }));

    botClient = botClientRefreshed;
    return botClient;
}

const twitterEnabled = process.argv.includes('--twitter');

if (twitterEnabled) {
    await createClient();
}

const startedTime = Date.now();
let totalTweets = 0;

export async function tweetShowtimes(showtime: Showtime, goodSeats: GoodSeats, blocks: number[]) {
    // Look for --twitter in process.argv
    if (!twitterEnabled) {
        return;
    }

    const showtimeTime = moment(showtime.time);
    // If showtime.time is in the past, don't tweet
    if (showtimeTime.isBefore(moment())) {
        return;
    }

    // If a showtime is in more than 14 days, only tweet about the 630pm and 1030pm showtimes
    // Unless it's a weekend, then tweet about all showtimes
    const isFarFuture = showtimeTime.isAfter(moment().add(14, 'days'));
    if (isFarFuture) {
        const hour = showtimeTime.hour();
        const day = showtimeTime.day();
        if (hour < 18 && !(day === 6 || day === 0)) {
            return;
        }
    }

    if (blocks.some((b) => b > 1)) {
        const maxBlock = Math.max(...blocks);

        // For far future showtimes, only tweet if there are 3 or more seats in the block
        if (isFarFuture && maxBlock < 3) {
            return;
        }

        const formattedDateTime = moment(showtime.time).tz('America/New_York').format('M/D h:mm A');
        const tweetBody = `${goodSeats.length} seats available for ${formattedDateTime} (${moment(
            showtime.time
        ).fromNow()}). ${goodSeats.map((s) => s?.name ?? '').join(', ')}. Block of ${maxBlock}. ${showtime.link}`;

        console.log(`Tweeting`, tweetBody);
        if (botClient) {
            // Calculate tweets per hour, and if it's too high (5 or more), don't tweet
            const hoursElapsed = (Date.now() - startedTime) / 1000 / 60 / 60;
            const tweetsPerHour = totalTweets / Math.max(hoursElapsed, 1);

            if (tweetsPerHour > 5) {
                console.log(`Too many tweets per hour (${totalTweets} total, ${tweetsPerHour} per hour), not tweeting`);
            } else {
                try {
                    totalTweets++;
                    await botClient.v2.tweet(tweetBody);
                } catch (e) {
                    console.log('Tweeting error', e);
                }
            }
        }
    }
}
