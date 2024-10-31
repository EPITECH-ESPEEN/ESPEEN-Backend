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
//TODO : fix and add isAuthenticatedUser middleware on Routes
// import { isAuthenticatedUser } from "../middlewares/userAuthentication";

export class TwitchApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([
        ["getUserIdFromAccessToken", getUserIdFromAccessToken],
        ["updateTwitchUserDescription", updateTwitchUserDescription],
        ["getTwitchBannedUser", getTwitchBannedUser],
        ["getTwitchModerators", getTwitchModerators],
    ]);

    async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        return null;
    }
}

//// Reactions ////

//INFO : More an utils function than a reaction
export async function getUserIdFromAccessToken(accessToken: string): Promise<string | null> {
    const url = "https://api.twitch.tv/helix/users";
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

//TO CHECK : if it's correct to retrieve accessToken like this (same logic for all reactions)
export async function updateTwitchUserDescription(user_id: string, descriptionUpdated: string) {
    const tokens = await ApiKey.findOne({user_id: user_id, service: "twitch"});
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user :", user_id);
        return null;
    }

    let accessToken = tokens.api_key;
    
    if (descriptionUpdated === "")
        return null;

    const url = `https://api.twitch.tv/helix/users?description=${encodeURIComponent(descriptionUpdated)}`;
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Content-Type": "application/json"
        },
    };
    try {
        const response = await axios.put(url, {}, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch Reaction | Update user description data res : ${response.data}`);
        return response.data;
    } catch (error) {
        console.error("Error when update Twitch user description :", error);
        return null;
    }
}

//TO CHECK : Requires a user access token that includes the moderation:read or moderator:manage:banned_users scope.
//TODO Handle dynamic broadcaster : add broadcaster_id in params (and update from field in frontend)
export async function getTwitchBannedUser(user_id: string) {
    const tokens = await ApiKey.findOne({ user_id: user_id, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user :", user_id);
        return null;
    }

    let accessToken = tokens.api_key;
    //TODO " broadcaster_id should be dynamic
    const broadcaster_id = getUserIdFromAccessToken(accessToken);
    if (!broadcaster_id) {
        console.error("No broadcaster_id found for user :", user_id);
        return null;
    }
    const url = `https://api.twitch.tv/helix/moderation/banned?broadcaster_id=${broadcaster_id}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Banned users data: ${JSON.stringify(response.data)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching banned users from Twitch:", error);
        return null;
    }
}

//TO CHECK : Requires a user access token that includes the moderation:read or moderator:manage:banned_users scope.
//TODO Handle dynamic broadcaster : add broadcaster_id in params (and update from field in frontend)
export async function getTwitchModerators(user_id: string) {
    const tokens = await ApiKey.findOne({ user_id: user_id, service: "twitch" });
    if (!tokens || !tokens.api_key) {
        console.error("No Twitch tokens found for user:", user_id);
        return null;
    }

    const accessToken = tokens.api_key;
    const broadcaster_id = getUserIdFromAccessToken(accessToken);
    if (!broadcaster_id) {
        console.error("No broadcaster_id found for user :", user_id);
        return null;
    }
    const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcaster_id}`;

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        },
    };

    try {
        const response = await axios.get(url, config);
        console.log("\x1b[36m%s\x1b[0m", `[DEBUG] Twitch API | Moderators data: ${JSON.stringify(response.data)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching moderators from Twitch:", error);
        return null;
    }
}



//// OAuth2 ////

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

twitchRouter.get('/twitch/auth', passport.authenticate('twitch', { scope: 'user_read' } ));

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
        res.redirect(`${process.env.FRONT_URL}/services`);

        if (accessToken) {
            if (refreshToken) {
                await createAndUpdateApiKey(accessToken, refreshToken, userAuthentifiedUid, "twitch");
            } else {
                await createAndUpdateApiKey(accessToken, "", userAuthentifiedUid, "twitch");
            }
            return;
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

////


export default twitchRouter;
