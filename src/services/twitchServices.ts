import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import axios from "axios";
import request from "request";

import User from "../models/userModel";
import ApiKey from "../models/apiKeyModels";
import { API } from "../utils/interfaces";
import { createAndUpdateApiKey } from "../controllers/apiKeyController";
import {getFormattedToken} from "../utils/token";

export class TwitchApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([
        ["getUserIdFromAccessToken", getUserIdFromAccessToken],
        ["update_description", updateTwitchUserDescription],
        ["get_banned_users", getTwitchBannedUser],
        ["get_modos", getTwitchModerators],
        ["get_channel_infos", getTwitchChannelInfo],
        ["get_user_clips", getTwitchUserClips],
        ["get_top_games", getTwitchTopGames],
        ["get_followed_channels", getTwitchFollowedChannels],
        ["get_channel_subscriptions", getTwitchChannelSubscriptions],
        ["send_chat_announcement", sendTwitchChatAnnouncement],
    ]);

    async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        if (!this.RouteMap.has(routes)) return null;
        const route = this.RouteMap.get(name);
        if (route === undefined) return null;
        return await route(params);
    }
}

//////////// Reactions ////////////

//INFO : More an util function than a reaction
export async function getUserIdFromAccessToken(message: any): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return null;
    }

    const accessToken = tokens.api_key;

    let url = "https://api.twitch.tv/helix/users";
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        const userData = (response.data as { data: { id: string }[] }).data[0];
        if (userData && userData.id) {
            console.log(`User ID retrieved: ${userData.id}`);
            return userData.id;
        } else {
            console.error("User data not found in response");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data from Twitch:", error);
        return null;
    }
}

export async function updateTwitchUserDescription(message: any) {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({user_id: uid, service: "twitch"});
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user :", message.user_uid);
        return message;
    }

    let accessToken = tokens.api_key;
    let descriptionUpdated = tokens.description;

    let url = `https://api.twitch.tv/helix/users?description=${descriptionUpdated}`;
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Content-Type": "application/json"
        },
    };

    try {
        const response = await axios.put(url, {}, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Update user description data res : ${response.data}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            console.log("\x1b[36m%s\x1b[0m", "[DEBUG] Twitch API | Access token expired, refreshing...");
            accessToken = await refreshTwitchAccessToken(message);
            if (!accessToken) {
                console.error(`Error refreshing Twitch access token for user: ${uid}`);
                return message;
            }
            config.headers.Authorization = `Bearer ${accessToken}`;
            const retryResponse = await axios.put(url, {}, config);
            const ret = {
                user_uid: message.user_uid,
                data: JSON.stringify(retryResponse.data),
            };
            return ret;
        } else {
        console.error("Error when update Twitch user description :", error);
        return message;
        }
    }
}


export async function getTwitchBannedUser(message: any) {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user :", uid);
        return message;
    }
    
    let accessToken = tokens.api_key;
    const broadcaster_id = await getUserIdFromAccessToken(message);
    if (!broadcaster_id) {
        console.error("No broadcaster_id found for user :", uid);
        return message;
    }
    let url = `https://api.twitch.tv/helix/moderation/banned?broadcaster_id=${broadcaster_id}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Banned users data: ${JSON.stringify(response.data)}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error) {
        console.error("Error fetching banned users from Twitch:", error);
        return message;
    }
}

export async function getTwitchModerators(message: any) {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return null;
    }

    const accessToken = tokens.api_key;
    const broadcaster_id = await getUserIdFromAccessToken(message);
    if (!broadcaster_id) {
        console.error("No broadcaster_id found for user :", uid);
        return message;
    }
    let url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcaster_id}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Moderators data: ${JSON.stringify(response.data)}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error) {
        console.error("Error fetching moderators from Twitch:", error);
        return message;
    }
}

//INFO : This request no need moderated scope (broadcaster_id can be what we want)
export async function getTwitchChannelInfo(message: any): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return message;
    }

    const accessToken = tokens.api_key;
    const broadcaster_id = await getUserIdFromAccessToken(message);
    if (!broadcaster_id) {
        console.error("No broadcaster_id found for user :", uid);
        return message;
    }
    let url = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcaster_id}`;
    
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        const responseData = response.data as { data: any[] };
        const channelData = responseData.data[0];
        if (channelData) {
            console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Twitch channel information retrieved: ${JSON.stringify(channelData)}`);
            const ret = {
                user_uid: message.user_uid,
                data: JSON.stringify(response.data),
            };
            return ret;
        } else {
            console.error("Twitch channel data not found in response");
            return message;
        }
    } catch (error) {
        console.error("Error fetching channel information from Twitch:", error);
        return message;
    }
}

//INFO : "first" parameter is optional (is the maximum number of items to return)
export async function getTwitchUserClips(message: any, first: number = 5): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return message;
    }

    const accessToken = tokens.api_key;
    const broadcaster_id = await getUserIdFromAccessToken(message);
    if (!broadcaster_id) {
        console.error("No broadcaster_id found for user :", uid);
        return message;
    }
    let url = `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcaster_id}&first=${first}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Clips data retrieved: ${JSON.stringify(response.data)}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error) {
        console.error("Error fetching clips from Twitch:", error);
        return message;
    }
}

//INFO : "first" parameter is optional (is the maximum number of items to return)
export async function getTwitchTopGames(message: any, first: number = 5): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return message;
    }

    const accessToken = tokens.api_key;
    const url = `https://api.twitch.tv/helix/games/top?first=${first}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Top games data retrieved: ${JSON.stringify(response.data)}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error) {
        console.error("Error fetching top games from Twitch:", error);
        return message;
    }
}

//TODO NEW 
export async function getTwitchFollowedChannels(message: any): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return message;
    }

    const accessToken = tokens.api_key;
    const user_id = await getUserIdFromAccessToken(message);
    if (!user_id) {
        console.error("No Twitch user_id found for user :", uid);
        return message;
    }
    let url = `https://api.twitch.tv/helix/channels/followed?user_id=${user_id}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Channels followed : ${JSON.stringify(response.data)}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error) {
        console.error("Error fetching followed channels from Twitch:", error);
        return message;
    }
}

//TODO NEW
export async function getTwitchChannelSubscriptions(message: any): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return message;
    }

    const accessToken = tokens.api_key;
    const user_id = await getUserIdFromAccessToken(message);
    if (!user_id) {
        console.error("No broadcaster_id found for user :", uid);
        return message;
    }
    let url = `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${user_id}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Channel subscriptions : ${JSON.stringify(response.data)}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error) {
        console.error("Error fetching channel subscriptions clips from Twitch:", error);
        return message;
    }
}

export async function sendTwitchChatAnnouncement(message: any): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", uid);
        return message;
    }

    const accessToken = tokens.api_key;
    const user_id = await getUserIdFromAccessToken(message);
    if (!user_id) {
        console.error("No broadcaster_id found for user :", uid);
        return message;
    }
    let url = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${user_id}&moderator_id=${user_id}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Content-Type": "application/json",
        },
    };

    const data = {
        message: tokens.description,
    }

    try {
        const response = await axios.post(url, data, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Chat announcement return status (204 Successfully sent the announcement) : ${response.status}`);
        const ret = {
            user_uid: message.user_uid,
            data: JSON.stringify(response.data),
        };
        return ret;
    } catch (error) {
        console.error("Error send Twitch chat announcement:", error);
        return message;
    }
}

//////////// Handle token access ////////////

async function refreshTwitchAccessToken(message: any): Promise<any | null> {
    const uid: number = message.user_uid;
    const tokens = await ApiKey.findOne({ user_id: uid, service: 'twitch' });
    if (!tokens || !tokens.refresh_token) {
        console.error("No Twitch refresh token found for user:", uid);
        return null;
    }

    const refreshToken = tokens.refresh_token;
    const url = 'https://id.twitch.tv/oauth2/token';
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
    });

    try {
        const response = await axios.post(url, params);
        const responseData = response.data as { access_token: string, refresh_token: string };
        const newAccessToken = responseData.access_token;
        const newRefreshToken = responseData.refresh_token;

        await createAndUpdateApiKey(newAccessToken, newRefreshToken, uid, 'twitch');
        return newAccessToken;
    } catch (error) {
        console.error("Error refreshing Twitch access token:", error);
        return null;
    }
}


//////////// OAuth2 ////////////

const twitchRouter = express.Router();

twitchRouter.use(session({
    secret: process.env.SESSION_SECRET || "some_random_secret",
    resave: false,
    saveUninitialized: false
}));
twitchRouter.use(express.static('public'));
twitchRouter.use(passport.initialize());
twitchRouter.use(passport.session());

OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
    var options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Authorization': 'Bearer ' + accessToken
        }
    };
    request(options, function (error, response, body) {
        if (response && response.statusCode == 200) {
            done(null, JSON.parse(body));
        } else {
            done(JSON.parse(body));
        }
    });
}

passport.serializeUser((user: any, done) => {
    done(null, user);
});
passport.deserializeUser((user: any, done) => {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
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
            done(null, profile);
        } catch (error) {
            console.error("Error during authentication:", error);
            done(error);
        }
    }
));

twitchRouter.get('/twitch/auth', passport.authenticate('twitch', { 
    scope: [
            'channel:manage:moderators',
            'channel:read:subscriptions',
            'moderator:manage:announcements',
            'moderator:manage:banned_users',
            'moderation:read',
            'user:edit',
            'user:read:follows',
        ]
}));

twitchRouter.get('/twitch/callback', passport.authenticate('twitch', {
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

        if (accessToken) {
            if (refreshToken) {
                await createAndUpdateApiKey(accessToken, refreshToken, userAuthentifiedUid, "twitch");
            } else {
                await createAndUpdateApiKey(accessToken, "", userAuthentifiedUid, "twitch");
            }
            return res.status(200).send("Twitch account linked, come back to the app");
        } else {
            console.error("Access token or refresh token is missing");
            return res.status(500).send("Internal Server Error");
        }
    } else {
        return res.status(400).send("Validation code is missing");
    }
});

twitchRouter.get("/twitch/logout", async (req, res) => {
    try {
        const authHeader = getFormattedToken(req);
        const userToken = await ApiKey.deleteOne({user_token: authHeader, service: "twitch"});
        if (!userToken) {
            return res.status(401).json({error: "Unauthorized"});
        }
        // res.status(200).json({message: "User deleted successfully"});
        res.redirect(`${process.env.FRONT_URL}/services`);
    } catch (error) {
        console.error("Error in /api/twitch/logout route:", error);
        return res.status(500).json({error: "Failed to process user"});
    }
});



////////////


export default twitchRouter;
