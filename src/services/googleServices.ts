import ApiKey from "../models/apiKeyModels";
import axios from "axios";
import { API } from "../utils/interfaces";
import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import User from "../models/userModel";
import { createAndUpdateApiKey } from "../controllers/apiKeyController";
import { getFormattedToken } from "../utils/token";

export async function isAuthToGoogle(user_uid: number) {
    const tokens = await ApiKey.find({ user_id: user_uid });
    if (tokens.length === 0) {
        return false;
    }
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].service === "google") {
            return true;
        }
    }
    return false;
}

export async function getUserEmail(user_uid: string) {
    const tokens = await ApiKey.findOne({ user_id: user_uid, service: "google" });

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
        const response: any = await axios.get(url, config);
        return response.data.email;
    } catch (error: any) {
        console.error("Erreur lors de la récupération de l'email :", error.response ? error.response.data : error.message);
        return null;
    }
}

export async function sendEmails(message: any) {
    if (message === undefined) return null;
    const tokens = await ApiKey.findOne({ user_id: message.user_uid, service: "google" });

    const email_u = await getUserEmail(message.user_uid);

    if (!tokens || !tokens.api_key) {
        console.error("No tokens found for user:", message.user_uid);
        return null;
    }

    if (!email_u) {
        console.error("No email found for user:", message.user_uid);
        return null;
    }

    const email = `To: ${email_u}\r\n` + "Subject: EPSEEN Reaction\r\n\r\n" + `${message.data}`;

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
        await axios.post(url, data, config);
    } catch (error: any) {
        console.error("Erreur lors de l'envoi de l'email :", error.response ? error.response.data : error.message);
    }
    return true;
}

export class GmailRoutes implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([
        ["receive_email", checkEmails],
        ["send_email", sendEmails],
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

export class DriveRoutes implements API {
    ApiMap: Map<string, API> = new Map<string, API>();

    redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        return null;
    }
}

export class GoogleApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>([
        ["gmail", new GmailRoutes()],
        ["drive", new DriveRoutes()],
    ]);

    redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        if (!this.ApiMap.has(name)) return null;
        if (params) return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), params, access_token, user_uid);
        return this.ApiMap.get(name)?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), undefined, access_token, user_uid);
    }
}

const googleRouter = express.Router();
dotenv.config();

const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.GOOGLE_CALLBACK); // const {GoogleAuth} = require('google-auth-library') ?
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/gmail.send"];
let previousMessageIds: string[] = [];

async function checkEmails(user_uid: string) {
    const tokens = await ApiKey.findOne({ user_id: user_uid, service: "google" });

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

            await ApiKey.updateOne({ user: user_uid, service: "google" }, { access_token: accessToken, refresh_token: refreshToken });

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
        res.redirect(`${process.env.FRONT_URL}/services`);
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

googleRouter.get("/google/logout", async (req, res) => {
    try {
        const authHeader = getFormattedToken(req);
        const userToken = await ApiKey.deleteOne({user_token: authHeader, service: "google"});
        if (!userToken) {
            return res.status(401).json({error: "Unauthorized"});
        }
        res.redirect(`${process.env.FRONT_URL}/services`);
        return res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        console.error("Error in /api/google/auth route:", error);
        return res.status(500).json({error: "Failed to process user"});
    }
});

export default googleRouter;