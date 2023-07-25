import { envStr } from '@rpappa/env';
import { TwitterApi } from 'twitter-api-v2';
import prompts from 'prompts';
import fs from 'fs';
import { config } from 'dotenv';
config();

// Instantiate with desired auth type (here's Bearer v2 auth)
const client = new TwitterApi({ clientId: envStr`TWITTER_CLIENT_ID`, clientSecret: envStr`TWITTER_CLIENT_SECRET` });

async function doAuth() {
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink('http://localhost:7777', {
        scope: ['tweet.read', 'users.read', 'tweet.write', 'offline.access'],
    });

    console.log(url);

    const response = await prompts({
        type: 'text',
        name: 'redirect',
        message: 'Paste the redirect URL here',
    });

    const parsed = new URL(`${response.redirect}`);

    const code = parsed.searchParams.get('code');

    const { accessToken, refreshToken } = await client.loginWithOAuth2({
        code: code ?? '',
        codeVerifier: codeVerifier ?? '',
        redirectUri: 'http://localhost:7777',
    });

    fs.writeFileSync('.twitter.json', JSON.stringify({ accessToken, refreshToken }));
}

await doAuth();
