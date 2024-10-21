import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";
import User from "../models/userModel";
import {createAndUpdateApiKey} from "../controllers/apiKeyController";
import {API} from "../utils/interfaces";

export const sendFacebookMessage = async (message: any) => {
};

export const checkFacebookMessage = async (message: any) => {

};

export class FacebookReactionApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([
        ["send_message", sendFacebookMessage],
    ]);

    async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        if (!this.RouteMap.has(routes)) return null;
        const route = this.RouteMap.get(name);
        if (route === undefined) return null;
        if (name === "send") return await route(params);
        if (params) return await route(params);
        return await route();
    }
}

export class FacebookActionApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([
        ["receive_message", checkFacebookMessage],
    ]);

    async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        if (!this.RouteMap.has(routes)) return null;
        const route = this.RouteMap.get(name);
        if (route === undefined) return null;
        if (name === "recep") return await route(user_uid);
        if (params) return await route(params);
        return await route();
    }
}

export class FacebookApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>([
        ["action", new FacebookActionApi()],
        ["reaction", new FacebookReactionApi()],
    ]);

    redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        // ? Perhaps add security to verify if user is auth to DB
        if (!this.ApiMap.has(name)) return null;
        if (params) return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), params, access_token, user_uid);
        return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), undefined, access_token, user_uid);
    }
}

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