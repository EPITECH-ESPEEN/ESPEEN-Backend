import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Stategy } from "passport-oauth2";

import User from "../models/userModel";
import { createAndUpdateApiKey } from "../controllers/apiKeyController";


const twitchRouter = express();

twitchRouter.use(session({
    secret: process.env.SESSION_SECRET || "some_random_secret",
    resave: false,
    saveUninitialized: false
}));
twitchRouter.use(passport.initialize());
twitchRouter.use(passport.session());

////////////////////////////// SET PASSPORT OAUTH2 //////////////////////////////

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user: any, done) => {
    done(null, user);
});

passport.use(new OAuth2Stategy({
        authorizationURL: "https://id.twitch.tv/oauth2/authorize",
        tokenURL: "https://id.twitch.tv/oauth2/token",
        clientID: process.env.TWITCH_CLIENT_ID!,
        clientSecret: process.env.TWITCH_CLIENT_SECRET!,
        callbackURL: process.env.TWITCH_CALLBACK_URL!,
        state: true,
    },
    async(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
//TODO : Securely store user profile in DB
    //User.findOrCreate(..., function(err, user) {
    //  done(err, user);
    //});
            done(null, profile);
        } catch (error) {
            done(error);
        }
    }
));

////////////////////////////// ROUTES //////////////////////////////

twitchRouter.get('/twitch/auth', passport.authenticate('oauth2', { scope: ['user:read:email'] }));
twitchRouter.get('/twitch/callback', passport.authenticate('oauth2', {
    failureRedirect: '/login'
}), async (req, res) => {
    const { accessToken, refreshToken } = req.user as any;
    const code = req.query.code;

    if (code) {
        const authHeader = req.cookies.authToken;
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
        }
        
        const userAuthentified = await User.findOne({ user_token: authHeader });
        if (!userAuthentified) {
            return res.status(401).json({ error: "Unauthorized: Invalid user authentified" });
        }
        
        const userAuthentifiedUid = userAuthentified.uid;

        if (accessToken) {
            if (refreshToken) {
                await createAndUpdateApiKey(accessToken, refreshToken, userAuthentifiedUid, "twitch");
            } else {
                await createAndUpdateApiKey(accessToken, "", userAuthentifiedUid, "twitch");
            }
            return res.status(200).send("Google account linked, come back to the app");
        } else {
            console.error("Access token or refresh token is missing");
            return res.status(500).send("Internal Server Error");
        }
    } else {
        return res.status(400).send("Validation code is missing");
    }
});

export default twitchRouter;
