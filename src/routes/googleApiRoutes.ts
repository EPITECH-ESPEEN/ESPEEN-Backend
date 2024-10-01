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
import { google } from 'googleapis';
import dotenv from "dotenv";
// import { PubSub } from '@google-cloud/pubsub';

// interface API {
//     routes: [string];
//
//     router(): void;
// }
//
// class GoogleApi implements API {
//
// }

const googleRouter = express.Router();
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'http://localhost:4242/api/oauth2callback'
);
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
let previousMessageIds: string[] = [];

async function checkEmails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        q: 'is:unread',
    });

    const messages = res.data.messages || [];
    const currentMessageIds = messages.map(message => message.id);

    const newMessages = currentMessageIds.filter(id => !previousMessageIds.includes(id));

    if (newMessages.length > 0) {
        console.log(`New emails found: ${newMessages.length}`);
        previousMessageIds = currentMessageIds;
    } else {
        console.log('No new emails.');
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

        res.send('Authentification réussie, tu peux fermer cette fenêtre.');
        setInterval(async () => checkEmails(oauth2Client), 5000);
    } else {
        res.status(400).send('Code de validation manquant');
    }
});

export default googleRouter;
