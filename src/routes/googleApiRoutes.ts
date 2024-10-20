/*
('-. .-.   ('-.     _  .-')  _ .-') _    ('-.                                                _  .-')     _ (`-.
( OO )  /  ( OO ).-.( \( -O )( (  OO) ) _(  OO)                                              ( \( -O )   ( (OO  )
,--. ,--.  / . --. / ,------. \     .'_(,------. .-'),-----. ,--.         .-----. .-'),-----. ,------.  _.`     \
|  | |  |  | \-.  \  |   /`. ',`'--..._)|  .---'( OO'  .-.  '|  |.-')    '  .--./( OO'  .-.  '|   /`. '(__...--''
|   .|  |.-'-'  |  | |  /  | ||  |  \  '|  |    /   |  | |  ||  | OO )   |  |('-./   |  | |  ||  /  | | |  /  | |
|       | \| |_.'  | |  |_.' ||  |   ' (|  '--. \_) |  |\|  ||  |`-' |  /_) |OO  )_) |  |\|  ||  |_.' | |  |_.' |
|  .-.  |  |  .-.  | |  .  '.'|  |   / :|  .--'   \ |  | |  (|  '---.'  ||  |`-'|  \ |  | |  ||  .  '.' |  .___.'
|  | |  |  |  | |  | |  |\  \ |  '--'  /|  `---.   `'  '-'  '|      |  (_'  '--'\   `'  '-'  '|  |\  \  |  |  .-.
`--' `--'  `--' `--' `--' '--'`-------' `------'     `-----' `------'     `-----'     `-----' `--' '--' `--'  `-'
*/

import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import { createAndUpdateApiKey } from "../controllers/apiKeyController";
import axios from "axios";
import apiKeyModels from "../models/apiKeyModels";
import fs from "fs";
import User from "../models/userModel";

interface API {
  ApiMap: Map<string, API>;

  redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string): any;
}

export class MeteoApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();

  async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    if (params === undefined) return null;
    try {
      const url = `https://api.weatherapi.com/v1/current.json?q=${params}&lang=fr&key=${process.env.WEATHER_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const weatherData = await response.json();
      let message = {};
      message["user_uid"] = user_uid;
      message["data"] = `La température actuelle à ${weatherData.location.name} est de ${weatherData.current.temp_c}°C.`;
      return message;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

async function getUserEmail(user_uid: string) {
  const tokens = await apiKeyModels.findOne({ user_id: user_uid, service: "google" });

  if (!tokens || !tokens.api_key) {
    console.error("No tokens found for user:", user_uid);
    return null;
  }

  let accessToken = tokens.api_key;

  const url = "https://www.googleapis.com/userinfo/v2/me";
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    return response.data.email;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'email :", error.response ? error.response.data : error.message);
    return null;
  }
}

async function sendEmails(message: any) {
  if (message === undefined) return null;
  const serviceAccount = JSON.parse(fs.readFileSync("espeen-ez-o7-creds.json", "utf-8"));
  const tokens = await apiKeyModels.findOne({ user_id: message.user_uid, service: "google" });

  const email_u = await getUserEmail(message.user_uid);

  if (!tokens || !tokens.api_key) {
    console.error("No tokens found for user:", message.user_uid);
    return null;
  }

  if (!email_u) {
    console.error("No email found for user:", message.user_uid);
    return null;
  }

  const email = `To: ${email_u}\r\n` + "Subject: Meteo de ESPEEN\r\n\r\n" + `${message.data}`;

  const encodedMessage = Buffer.from(email).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
  const config = {
    headers: {
      Authorization: `Bearer ${tokens.api_key}`,
      "Content-Type": "application/json",
    },
  };

  const data = {
    raw: encodedMessage,
  };

  try {
    const response = await axios.post(url, data, config);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error.response ? error.response.data : error.message);
  }
}

class GmailRoutes implements API {
  ApiMap: Map<string, API> = new Map<string, API>();
  RouteMap: Map<string, Function> = new Map<string, Function>([
    ["recep_email", checkEmails],
    ["send", sendEmails],
  ]);

  async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    if (!this.RouteMap.has(routes)) return null;
    const route = this.RouteMap.get(name);
    if (route === undefined) return null;
    if (name === "recep_email") return await route(user_uid);
    if (params) return await route(params);
    return await route();
  }
}

class DriveRoutes implements API {
  ApiMap: Map<string, API> = new Map<string, API>();

  redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    return null;
  }
}

class GoogleApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>([
    ["gmail", new GmailRoutes()],
    ["drive", new DriveRoutes()],
  ]);

  redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    // ? Perhaps add security to verify if user is auth to DB
    if (!this.ApiMap.has(name)) return null;
    if (params) return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), params, access_token, user_uid);
    return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), undefined, access_token, user_uid);
  }
}

export class APIRouter implements API {
  ApiMap: Map<string, API> = new Map<string, API>([
    ["google", new GoogleApi()],
    ["meteo", new MeteoApi()],
  ]);

  redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    const service: string[] = routes.split(".");

    if (!this.ApiMap.has(name)) return null;
    if (params) return this.ApiMap.get(name)?.redirect_to(service[0], routes.replace(service[0] + ".", ""), params, access_token, user_uid);
    return this.ApiMap.get(name)?.redirect_to(service[0], routes.replace(service[0] + ".", ""), undefined, access_token, user_uid);
  }
}

const googleRouter = express.Router();
dotenv.config();

const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, "http://localhost:8080/api/google/oauth2callback"); // const {GoogleAuth} = require('google-auth-library') ?
//TODO : use process.env is better here for links
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/gmail.send"];
let previousMessageIds: string[] = [];

async function checkEmails(user_uid: string) {
  const tokens = await apiKeyModels.findOne({ user_id: user_uid, service: "google" });

  if (!tokens || !tokens.api_key) {
    console.error("No tokens found for user:", user_uid);
    return null;
  }

  let accessToken = tokens.api_key;
  let refreshToken = tokens.refresh_token;

  // Check if access token is expired
  if (oauth2Client.credentials.expiry_date && oauth2Client.credentials.expiry_date <= Date.now()) {
    try {
      // Refresh the token using the stored refresh token
      let { token: accessToken } = await oauth2Client.getAccessToken();
      accessToken = oauth2Client.credentials.access_token;

      await apiKeyModels.updateOne({ user: user_uid, service: "google" }, { access_token: accessToken, refresh_token: refreshToken });

      oauth2Client.setCredentials({ access_token: accessToken });
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  } else {
    oauth2Client.setCredentials({ access_token: accessToken });
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    };
    const response = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&q=is:unread", config);

    const data = response.data as { messages: any[] };
    const messages = data.messages || [];
    const currentMessageIds = messages.map((message: any) => message.id);

    const newMessages = currentMessageIds.filter((id: any) => id && !previousMessageIds.includes(id));

    if (newMessages.length > 0) {
      previousMessageIds = currentMessageIds.filter((id: any) => id !== null && id !== undefined) as string[];

      const msg = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${newMessages[0]}`, config);
      const payload = (msg.data as any).payload;
      const part = payload.parts?.find((part: { mimeType: string }) => part.mimeType === "text/plain");
      const body = part?.body?.data;

      if (body) {
        const decodedBody = Buffer.from(body, "base64").toString("utf-8");
        return decodedBody;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error while fetching messages:", error);
    return null;
  }
}

googleRouter.get("/google/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

googleRouter.get("/google/oauth2callback", async (req, res) => {
  const code = req.query.code;

  if (code) {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

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
    if (tokens.access_token) {
      if (tokens.refresh_token) {
        await createAndUpdateApiKey(tokens.access_token, tokens.refresh_token, user_uid, "google");
      } else await createAndUpdateApiKey(tokens.access_token, "", user_uid, "google");
      return;
    } else {
      console.error("Access token or refresh token is missing");
      return res.status(500).send("Internal Server Error");
    }
  } else {
    return res.status(400).send("Code de validation manquant");
  }
});

export default googleRouter;
