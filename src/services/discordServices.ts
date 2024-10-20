import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import {API} from "../utils/interfaces";
import fetch from "node-fetch";
import express from "express";
import dotenv from "dotenv";
import {Strategy as DiscordStrategy} from "passport-discord";
import session from "express-session";
import passport from "passport";
import User from "../models/userModel";
import ApiKey from "../models/apiKeyModels";
import {createAndUpdateApiKey} from "../controllers/apiKeyController";
import {isAuthenticatedUser} from "../middlewares/userAuthentication";

export const discordMessageWebhook = async (message: any) => {
  if (message === undefined) return null;
  const uid: number = message.user_uid;
  const users = await ApiKey.findOne({ user_id: uid, service: "discord" });
  const response = await fetch(users.webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message.data }),
  });
  if (!response.ok) {
    return console.log("Error while sending message to Discord");
  }
  return console.log("Message sent to Discord");
};

export let isAuthToDiscord = false;

export class DiscordWebhookApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();
  RouteMap: Map<string, Function> = new Map<string, Function>([
    ["send", discordMessageWebhook],
  ]);

  async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    if (!this.RouteMap.has(routes)) return null;
    const route = this.RouteMap.get(name);
    if (route === undefined) return null;
    if (name === "send_message") return await route(user_uid);
    if (params) return await route(params);
    return await route();
  }
}

export class DiscordApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>([
    ["webhook", new DiscordWebhookApi()],
  ]);

  redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    // ? Perhaps add security to verify if user is auth to DB
    if (!this.ApiMap.has(name)) return null;
    if (params) return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), params, access_token, user_uid);
    return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), undefined, access_token, user_uid);
  }
}

const discordRouter = express.Router();
dotenv.config();

const discordStrategy = new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackURL: process.env.DISCORD_CALLBACK_URL!,
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        (profile as any).accessToken = accessToken;
        isAuthToDiscord = true;
        done(null, profile);
      } catch (error) {
        console.error("Error during authentication:", error);
        done(error, false);
      }
    }
);

discordRouter.use(
    session({
      secret: process.env.SESSION_SECRET || "some_random_secret",
      resave: false,
      saveUninitialized: true,
    })
);
discordRouter.use(passport.initialize());
discordRouter.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(discordStrategy);

// @ts-ignore
discordRouter.get("/discord/auth", isAuthenticatedUser, (req, res) => {
  passport.authenticate("discord")(req, res);
});

// @ts-ignore
discordRouter.get("/discord/callback", isAuthenticatedUser, passport.authenticate("discord", {
      failureRedirect: "/login",
      session: true,
    }),
    async (req, res) => {
      const tokens = req.user;

      console.log("Access token:", tokens);
      if (!tokens) {
        return res.status(500).send("Internal Server Error");
      }
      const code = req.query.code;

      if (code) {
        const authHeader = req.cookies.authToken;
        if (!authHeader) {
          return res.status(401).json({ error: "Authorization header is missing" });
        }
        const userToken = await User.findOne({ user_token: authHeader });
        if (!userToken) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const user_uid = userToken.uid;
        res.redirect(`http://localhost:3000/services`);
        if (tokens.accessToken) {
          if (tokens.refreshToken) {
            await createAndUpdateApiKey(tokens.accessToken, tokens.refreshToken, user_uid, "discord");
          } else await createAndUpdateApiKey(tokens.accessToken, "", user_uid, "discord");
          return;
        } else {
          console.error("Access token or refresh token is missing");
          return res.status(500).send("Internal Server Error");
        }
      } else {
        return res.status(400).send("Code de validation manquant");
      }
    }
);

// @ts-ignore
discordRouter.get("/discord/check-auth", isAuthenticatedUser, (req, res) => {
  if (isAuthToDiscord) {
    res.send("User is authenticated with Discord.");
  } else {
    res.status(401).send("User is not authenticated.");
  }
});

// @ts-ignore
discordRouter.get("/discord/discord-data", isAuthenticatedUser, async (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const accessToken = (req.user as any).accessToken;

    if (accessToken) {
      const discordApi = new DiscordApi();
      const discordData = await discordApi.redirect_to("discord", "user", accessToken);

      if (discordData) {
        res.json(discordData);
      } else {
        res.status(500).send("Failed to retrieve Discord user data.");
      }
    } else {
      res.status(401).send("User is not authenticated with Discord.");
    }
  } else {
    res.status(401).send("User is not authenticated.");
  }
});

export default discordRouter;
