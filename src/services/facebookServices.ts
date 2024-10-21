import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";
import User from "../models/userModel";
import {createAndUpdateApiKey} from "../controllers/apiKeyController";

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

passport.deserializeUser((user, done) => {
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
    if (code) {
        const authHeader = req.cookies.authToken;
        if (!authHeader) {
            return res.status(401).json({error: "Authorization header is missing"});
        }
        const userToken = await User.findOne({user_token: authHeader});
        if (!userToken) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const user_uid = userToken.uid;
        res.redirect(`http://localhost:3000/services`);
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
        return res.status(400).send("Validation code is missing");
    }
});

export default fbRouter;