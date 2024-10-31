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
            return;
        } else {
            console.error("Access token or refresh token is missing");
            return res.status(500).send("Internal Server Error");
        }
    } else {
        return res.status(400).send("Validation code is missing");
    }
});

export default twitchRouter;
