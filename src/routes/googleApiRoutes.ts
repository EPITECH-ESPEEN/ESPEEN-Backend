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
import { PubSub } from '@google-cloud/pubsub';

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

// const authServiceAccount = new google.auth.GoogleAuth({
//     keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
//     scopes: ['https://www.googleapis.com/auth/cloud-platform'],
// });

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'http://localhost:4242/api/oauth2callback'
);

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
const pubSubClient = new PubSub();
const subscriptionName = 'mailNotif-sub';
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function startWatchForUser(auth: any)
{
    const res = await gmail.users.watch({
        userId: 'me',
        requestBody: {
            topicName: 'projects/espeen-ez-o7/topics/mailNotif',
            labelIds: ['INBOX'],
        },
    });

    console.log("Notifications activées pour l'utilisateur");
    console.log(res.data);
}

async function getNewEmails(userId: string, historyId: string) {
    try {
        const res = await gmail.users.history.list({
            userId: userId,
            startHistoryId: historyId,
        });

        console.log('res', res);
        console.log('Historique:', res.data);

        const history = res.data.history || [];

        const newMessages: any[] = [];
        history.forEach((event: any) => {
            if (event.messagesAdded) {
                event.messagesAdded.forEach((message: any) => {
                    newMessages.push(message.message);
                });
            }
        });

        return newMessages;
    } catch (error) {
        console.error('Erreur lors de la récupération des nouveaux emails:', error);
        return [];
    }
}

async function getEmailContent(userId: string, messageId: string, auth: any) {

    const res = await gmail.users.messages.get({
        userId: userId,
        id: messageId,
    });
    return res.data;
}

async function listenForMessages(auth: any) {
    const subscription = pubSubClient.subscription(subscriptionName);

    const messageHandler = async (message: any) => {
        console.log(`Message reçu: ${message.data}`);
        const data = JSON.parse(Buffer.from(message.data, 'base64').toString());

        const historyId = data.historyId;

        const newEmails = await getNewEmails('me', historyId, auth);
        console.log('Nouveaux emails:', newEmails);

        if (newEmails.length > 0) {
            console.log(`Nouveaux emails détectés (${newEmails.length}):`);
            for (const email of newEmails) {
                console.log(`- Email ID: ${email.id}`);
                const emailContent = await getEmailContent('me', email.id, auth);
                console.log(emailContent);
            }
        } else {
            console.log('Aucun nouveau message.');
        }
        message.ack();
    };

    subscription.on('message', messageHandler);
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
        await startWatchForUser(oauth2Client);
        listenForMessages(oauth2Client).catch(console.error);
    } else {
        res.status(400).send('Code de validation manquant');
    }
});

googleRouter.post('/notifications', (req, res) => {
    const message = req.body.message;

    const messageData = Buffer.from(message.data, 'base64').toString('utf-8');
    console.log('Notification Pub/Sub:', messageData);

    if (messageData.includes('email')) {
        console.log("pipi");
    }

    res.status(200).send();
});

export default googleRouter;
