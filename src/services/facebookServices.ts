import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/userModel";
import {createAndUpdateApiKey} from "../controllers/apiKeyController";
import ApiKey from "../models/apiKeyModels";
import {getFormattedToken} from "../utils/token";

const fbRouter = express();

fbRouter.use(session({
    secret: process.env.SESSION_SECRET || "some_random_secret",
    resave: false,
    saveUninitialized: true
}));

fbRouter.use(passport.initialize());
fbRouter.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
        profileFields: ["id", "emails", "name"]
    },
    (accessToken, refreshToken, profile, done) => {
        done(null, {accessToken, refreshToken});
    }
));

fbRouter.get('/facebook/auth', passport.authenticate('facebook', { scope: ['email'] }));


fbRouter.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/login'
}), async (req, res) => {
    const { accessToken, refreshToken } = req.user as any;
    const code = req.query.code;
    if (!code) {
        return res.status(400).send("Validation code is missing");
    }
    const authHeader = req.cookies.authToken;
    if (authHeader) {
        const userToken = await User.findOne({user_token: authHeader});
        if (!userToken) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const user_uid = userToken.uid;
        res.redirect(`${process.env.FRONT_URL}/services`);
        if (accessToken) {
            if (refreshToken) {
                await createAndUpdateApiKey(accessToken, refreshToken, user_uid, "facebook");
            } else await createAndUpdateApiKey(accessToken, "", user_uid, "facebook");
            return;
        } else {
            console.error("Access token or refresh token is missing");
            return res.status(500).send("Internal Server Error");
        }
    } else {
        const db_token = await ApiKey.findOne({access_token: accessToken});
        if (!db_token) {
            return res.status(400).json({message: "Facebook account not linked"});
        }
        const user = await User.findOne({uid: db_token.user_id});
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }
        return res.status(200).json({ access_token: user.user_token });
    }
});

fbRouter.get('/facebook/logout', async (req, res) => {
    try {
        const authHeader = getFormattedToken(req);
        const userToken = await ApiKey.deleteOne({user_token: authHeader, service: "facebook"});
        if (!userToken) {
            return res.status(401).json({error: "Unauthorized"});
        }
        res.redirect(`${process.env.FRONT_URL}/services`);
        return res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        console.error("Error in /api/facebook/logout route:", error);
        return res.status(500).json({error: "Failed to process user"});
    }
});

export default fbRouter;