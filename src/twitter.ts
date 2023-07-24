import { envStr } from '@rpappa/env';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';
import { GoodSeats, Showtime } from './monitor.js';
import moment from 'moment-timezone';
config();

let botClient: TwitterApi | undefined = undefined;

async function createClient() {
    if (botClient) {
        return botClient;
    }
    // read .twitter.json
    const { refreshToken } = JSON.parse(fs.readFileSync('.twitter.json', 'utf-8'));

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
    // look for --twitter in process.argv
    if (!twitterEnabled) {
        return;
    }
    // if showtime.time is in the past, don't tweet
    if (moment(showtime.time).isBefore(moment())) {
        return;
    }
    if (blocks.some((b) => b > 1)) {
        const maxBlock = Math.max(...blocks);
        const formattedDateTime = moment(showtime.time).tz('America/New_York').format('M/D h:mm A');
        const tweetBody = `${goodSeats.length} seats available for ${formattedDateTime} (${moment(
            showtime.time
        ).fromNow()}). ${goodSeats.map((s) => s?.name ?? '').join(', ')}. Block of ${maxBlock}. ${showtime.link}`;

        console.log(`Tweeting`, tweetBody);
        if (botClient) {
            // calculate tweets per hour, and if it's too high (5 or more), don't tweet
            const hoursElapsed = (Date.now() - startedTime) / 1000 / 60 / 60;
            const tweetsPerHour = totalTweets / Math.max(hoursElapsed, 1);

            if (tweetsPerHour > 5) {
                console.log(`Too many tweets per hour (${totalTweets} total, ${tweetsPerHour} per hour), not tweeting`);
                return;
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
