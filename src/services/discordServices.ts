import {API} from "../utils/interfaces";
import fetch from "node-fetch";
import express from "express";
import {Strategy as DiscordStrategy} from "passport-discord";
import session from "express-session";
import passport from "passport";
import User from "../models/userModel";
import ApiKey from "../models/apiKeyModels";
import {createAndUpdateApiKey} from "../controllers/apiKeyController";
import {isAuthenticatedUser} from "../middlewares/userAuthentication";
import {getFormattedToken} from "../utils/token";

export const discordMessageWebhook = async (message: any) => {
  if (message === undefined) return null;
  const uid: number = message.user_uid;
  const users = await ApiKey.findOne({ user_id: uid, service: "discord" });
  if (!users) return null;
  const webhook = users.webhook;
  if (!webhook) return null;

  const response = await fetch(webhook, {
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

let lastMessageId: string | null = null;

export const checkMessageChannel = async (message: any) => {
  if (message === undefined) return
  const user = await ApiKey.findOne({ user_id: message, service: "discord" });
  if (!user) return null;
  const channel = user.channel;
    if (!channel) return null;
  const url = `https://discord.com/api/v9/channels/${channel}/messages`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch messages from Discord channel");
      return null;
    }

    const discordMessages = await response.json();
    const newMessages = discordMessages.filter((msg: any) => msg.id > lastMessageId);

    if (newMessages.length === 0) {
      console.log("No new messages in the channel.");
      return null;
    }
    if (lastMessageId === null) {
      lastMessageId = discordMessages[newMessages.length - 1].id;
      return null;
    }

    lastMessageId = newMessages[newMessages.length - 1].id;
    const writersAndContents = newMessages
        .map((msg: any) => `Writer: ${msg.author.username}, Content: ${msg.content}`)
        .join(" \n ");
    let messages = {
      user_uid: message,
      data: writersAndContents,
    };
    console.log("New messages from Discord channel:", messages);
    return messages;
  } catch (error) {
    console.error("Error while fetching messages:", error);
    return null;
  }
};

export let isAuthToDiscord = false;

export class DiscordWebhookApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();
  RouteMap: Map<string, Function> = new Map<string, Function>([
    ["send_message", discordMessageWebhook],
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

export class DiscordBotApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();
  RouteMap: Map<string, Function> = new Map<string, Function>([
    ["receive_message", checkMessageChannel],
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

export class DiscordApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>([
    ["webhook", new DiscordWebhookApi()],
    ["bot", new DiscordBotApi()],
  ]);

  redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    // ? Perhaps add security to verify if user is auth to DB
    if (!this.ApiMap.has(name)) return null;
    if (params) return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), params, access_token, user_uid);
    return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), undefined, access_token, user_uid);
  }
}

const discordRouter = express.Router();

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

discordRouter.get("/discord/auth", (req, res) => {
  passport.authenticate("discord")(req, res);
});

discordRouter.get("/discord/callback", passport.authenticate("discord", {
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
        res.redirect(`${process.env.FRONT_URL}/services`);
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

discordRouter.get("/discord/check-auth", (req, res) => {
  if (isAuthToDiscord) {
    res.send("User is authenticated with Discord.");
  } else {
    res.status(401).send("User is not authenticated.");
  }
});

discordRouter.get("/discord/discord-data", async (req, res) => {
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

discordRouter.get("/discord/logout", async (req, res) => {
  try {
    const authHeader = getFormattedToken(req);
    const userToken = await ApiKey.deleteOne({user_token: authHeader, service: "discord"});
    if (!userToken) {
      return res.status(401).json({error: "Unauthorized"});
    }
    res.redirect(`${process.env.FRONT_URL}/services`);
    // return res.status(200).json({message: "User deleted successfully"});
  } catch (error) {
    console.error("Error in /api/discord/logout route:", error);
    return res.status(500).json({error: "Failed to process user"});
  }
});

export default discordRouter;
