import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import axios from "axios";
import crypto from "crypto";
import nodeCron from "node-cron";
import { Strategy as OAuth2Strategy } from "passport-oauth2";

import User from "../models/userModel";
import { API } from "../utils/interfaces";
import { createAndUpdateApiKey } from "../controllers/apiKeyController";

//TODO : To complete
export class TwitchApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>();

    async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        return null;
    }
}

//////////// PASSPORT SETUP //////////////

const twitchRouter = express.Router();

twitchRouter.use(session({
    secret: process.env.SESSION_SECRET || "some_random_secret",
    resave: false,
    saveUninitialized: false
}));
twitchRouter.use(passport.initialize());
twitchRouter.use(passport.session());

passport.serializeUser((user: any, done) => {
    done(null, user);
});
passport.deserializeUser((user: any, done) => {
    done(null, user);
});

passport.use(new OAuth2Strategy({
        authorizationURL: "https://id.twitch.tv/oauth2/authorize",
        tokenURL: "https://id.twitch.tv/oauth2/token",
        clientID: process.env.TWITCH_CLIENT_ID!,
        clientSecret: process.env.TWITCH_CLIENT_SECRET!,
        callbackURL: process.env.TWITCH_CALLBACK_URL!,
        state: true,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;

            //TODO : ?Find an user with the profile
            // const user = await User.find(profile);
            // await createAndUpdateApiKey(accessToken, refreshToken, user.uid, "twitch");

            done(null, profile);
        } catch (error) {
            done(error);
        }
    }
));

//////////// ACTION CALLS //////////////


async function getFollowedStreamers(userId: string, accessToken: string): Promise<string[]> {
    const followedStreamers: string[] = [];
    let cursor: string | undefined = undefined;
    const url = 'https://api.twitch.tv/helix/users/follows';

    try {
        do {
            const response: { data: { data: any[], pagination?: { cursor?: string } } } = await axios.get(url, {
                params: {
                    from_id: userId,
                    after: cursor,
                    first: 100
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Client-Id": process.env.TWITCH_CLIENT_ID!
                }
            });

            const { data, pagination } = response.data;
            followedStreamers.push(...data.map((follower: any) => follower.to_id));
            cursor = pagination?.cursor;
        } while (cursor);

        return followedStreamers;
    } catch (error) {
        console.error("Error retrieving followed streamers: ", error);
        return [];
    }
}

async function subscribeToTwitchStreamEvent(streamerId: string, accessToken: string) {
    const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    const data = {
        type: "stream.online",
        version: "1",
        condition: { broadcaster_user_id: streamerId },
        transport: {
            method: "webhook",
            callback: process.env.TWITCH_WEBHOOK_CALLBACK,
            secret: process.env.TWITCH_WEBHOOK_SECRET
        }
    };
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
        "Content-Type": "application/json"
    };
    try {
        await axios.post(url, data, { headers });
    } catch (error) {
        console.error("Error during webhook subscription: ", error);
    }
}

async function subscribeToTwitchStreamsEvent(userId: string, accessToken: string) {
    const streamerIds = await getFollowedStreamers(userId, accessToken);
    for (const streamerId of streamerIds) {
        await subscribeToTwitchStreamEvent(streamerId, accessToken);
    }
}


////////////////////////////// OAUTH2 ROUTES //////////////////////////////

twitchRouter.get('/twitch/auth', passport.authenticate('oauth2', { scope: ['user:read:email'] }));

twitchRouter.get('/twitch/callback', passport.authenticate('oauth2', {
    failureRedirect: '/login'
}), async (req: Request, res: Response) => {
    const { accessToken, refreshToken } = req.user as any;
    const code = req.query.code;

    if (code) {
        const authHeader = req.cookies.authToken;
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
        }
        
        const userAuthentified = await User.findOne({ user_token: authHeader });
        if (!userAuthentified) {
            return res.status(401).json({ error: "Unauthorized: Invalid user authenticated" });
        }
        
        const userAuthentifiedUid = userAuthentified.uid;
        
        res.redirect(`http://localhost:3000/services`);
        
        if (accessToken) {
            if (refreshToken) {
                await createAndUpdateApiKey(accessToken, refreshToken, userAuthentifiedUid, "twitch");
            } else {
                await createAndUpdateApiKey(accessToken, "", userAuthentifiedUid, "twitch");
            }

            //TODO: est-ce que cette fonction s'appelle là ?
            await subscribeToTwitchStreamsEvent(userAuthentifiedUid.toString(), accessToken);

            return;
        } else {
            console.error("Access token or refresh token is missing");
            return res.status(500).send("Internal Server Error");
        }
    } else {
        return res.status(400).send("Validation code is missing");
    }
});

//TODO : To correct
//Doit return res 200 à Twitch si tout est ok
twitchRouter.post('/twitch/webhook', async (req: Request, res: Response) => {
    const messageId = req.header('Twitch-Eventsub-Message-Id');
    const messageSignature = req.header('Twitch-Eventsub-Message-Signature');
    const messageTimestamp = req.header('Twitch-Eventsub-Message-Timestamp');
    const requestBody = JSON.stringify(req.body);

    const calculatedSignature = 'sha256=' + crypto.createHmac('sha256', process.env.TWITCH_WEBHOOK_SECRET!)
        .update(messageId + messageTimestamp + requestBody)
        .digest('hex');

    if (calculatedSignature !== messageSignature) {
        return res.status(403).send('Invalid signature');
    }

    const { event } = req.body;

    if (event && event.type === "stream.online") {
        const streamerId = event.broadcaster_user_id;

        //TODO Return le message à envoyer en fonction de la réaction 
        console.log(`Le streamer ${streamerId} est en ligne !`);
    }

    res.status(200).send("Notification received");
});


//////////// CRON JOB //////////////

//TODO : To correct
async function removeExpiredSubscriptions() {
    const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    const headers = {
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
        //TODO : which token ?
        // Authorization: `Bearer ${accessToken}`
    };

    try {
        const response = await axios.get(url, { headers });
        const subscriptions = response.data.data;

        for (const subscription of subscriptions) {
            if (subscription.status === 'webhook_callback_verification_failed' || subscription.status === 'notification_failed') {
                await axios.delete(`${url}?id=${subscription.id}`, { headers });
                console.log(`Subscription ${subscription.id} has been removed due to verification failure.`);
            }
        }
    } catch (error) {
        console.error("Error when deleting expired subscriptions: ", error);
    }
}

nodeCron.schedule("0 0 * * *", async () => {
    console.log("Cleaning up expired subscriptions...");
    await removeExpiredSubscriptions();
});

export default twitchRouter;
