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

import express, {response} from "express";
import { google } from 'googleapis';
import dotenv, {config} from "dotenv";
import axios from 'axios';

export let isAuthToGoogle = false;

interface API {
    ApiMap: Map<string, API>;

    redirect_to(name: string, routes: string, params?: any): any;
}

class MeteoApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>();

    async redirect_to(name: string, routes: string, params?: any) {
        if (params === undefined)
            return null;
        try {
            const url = `https://api.weatherapi.com/v1/current.json?q=${params}&lang=fr&key=${process.env.WEATHER_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const weatherData = await response.json();
            console.log(weatherData);
            return weatherData;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

class GmailRoutes implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([["recep_email", checkEmails]]);

    async redirect_to(name: string, routes: string, params?: any) {
        if (!this.RouteMap.has(routes))
            return null;
        const route = this.RouteMap.get(name);
        if (route === undefined)
            return null;
        if (params)
            return await route(params);
        return await route();
    }
}

class DriveRoutes implements API {
    ApiMap: Map<string, API> = new Map<string, API>();

    redirect_to(name: string, routes: string, params?: any) {
        return null;
    }
}

class GoogleApi implements API {
    ApiMap: Map<string, API> = new Map<string, API>([
        ["gmail", new GmailRoutes()],
        ["drive", new DriveRoutes()]
    ]);

    redirect_to(name: string, routes: string, params?: any) {
        // ? Perhaps add security to verify if user is auth to DB
        if (!this.ApiMap.has(name))
            return null;
        if (params)
            return (this.ApiMap.get(name))?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""), params);
        return (this.ApiMap.get(name))?.redirect_to(routes.split(".")[0], routes.replace(routes.split(".")[0] + ".", ""));
    }
}

export class APIRouter implements API {
    ApiMap: Map<string, API> = new Map<string, API>([
        ["google", new GoogleApi()],
        ["meteo", new MeteoApi()]
    ]);

    redirect_to(name: string, routes: string, params?: any) {
        const service: string[] = routes.split(".");

        if (!this.ApiMap.has(name))
            return null;
        if (params)
            return (this.ApiMap.get(name))?.redirect_to(service[0], routes.replace(service[0] + ".", ""), params);
        return (this.ApiMap.get(name))?.redirect_to(service[0], routes.replace(service[0] + ".", ""));
    }
}

const googleRouter = express.Router();
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'http://localhost:4242/api/oauth2callback'
);
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
let previousMessageIds: string[] = [];

async function checkEmails() {
    let response;
    if (oauth2Client.credentials.expiry_date && oauth2Client.credentials.expiry_date <= Date.now()) {
        console.log('Token expiré, il faut le rafraîchir.');
        const {credentials} = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
    }
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
                'Accept': 'application/json',
            }
        };
        response = await axios.get(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&q=is:unread',
            config
        );
    } catch (error) {
        console.error('Error while fetching messages:', error);
    }

    const messages = response.data.messages || [];
    const currentMessageIds = messages.map(message => message.id);

    const newMessages = currentMessageIds.filter(id => id && !previousMessageIds.includes(id));

    if (newMessages.length > 0) {
        console.log(`New emails found: ${newMessages.length}`);
        previousMessageIds = currentMessageIds.filter(id => id !== null && id !== undefined) as string[];
        const config = {
            headers: {
                'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
                'Accept': 'application/json',
            }
        };
        const msg = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${currentMessageIds[0]}`,
            config
        );
        const payload = msg.data.payload;
        const part = payload.parts?.find(part => part.mimeType === 'text/plain');
        const body = part?.body?.data;

        if (body) {
            const decodedBody = Buffer.from(body, 'base64').toString('utf-8');
            console.log('Email content:', decodedBody);
            return decodedBody;
        } else {
            console.log('No plain text body found in this email.');
            return null;
        }
    } else {
        console.log('No new emails.');
        return null;
    }
}

googleRouter.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(authUrl);
});

googleRouter.get("/oauth2callback", async (req, res) => {
    const code = req.query.code;

    if (code) {
        const {tokens} = await oauth2Client.getToken(code as string);
        oauth2Client.setCredentials(tokens);

        isAuthToGoogle = true;
        res.send('Authentification réussie, tu peux fermer cette fenêtre.');
        // setInterval(async () => checkEmails(oauth2Client), 5000);
    } else {
        res.status(400).send('Code de validation manquant');
    }
});

export default googleRouter;
