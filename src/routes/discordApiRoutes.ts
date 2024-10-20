import express from "express";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { MeteoApi } from "./googleApiRoutes";
import session from "express-session";
import User from "../models/userModel";
import {createAndUpdateApiKey} from "../controllers/apiKeyController";

export let isAuthToDiscord = false;

interface API {
  ApiMap: Map<string, API>;

  redirect_to(name: string, routes: string, params?: any): any;
}

class DiscordApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();

  async redirect_to(name: string, routes: string, params?: any) {
    if (!params) return null;
    try {
      const url = `https://discord.com/api/v9/users/@me`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${params}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const discordData = await response.json();
      return discordData;
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}

export class APIRouter implements API {
  ApiMap: Map<string, API> = new Map<string, API>([
    ["discord", new DiscordApi()],
    ["meteo", new MeteoApi()],
  ]);

  redirect_to(name: string, routes: string, params?: any) {
    const service: string[] = routes.split(".");

    if (!this.ApiMap.has(name)) return null;
    if (params) return this.ApiMap.get(name)?.redirect_to(service[0], routes.replace(service[0] + ".", ""), params);
    return this.ApiMap.get(name)?.redirect_to(service[0], routes.replace(service[0] + ".", ""));
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

discordRouter.get("/auth", (req, res) => {
  passport.authenticate("discord")(req, res);
});

discordRouter.get("/callback",  passport.authenticate("discord", {
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

discordRouter.get("/check-auth", (req, res) => {
  if (isAuthToDiscord) {
    res.send("User is authenticated with Discord.");
  } else {
    res.status(401).send("User is not authenticated.");
  }
});

discordRouter.get("/discord-data", async (req, res) => {
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
