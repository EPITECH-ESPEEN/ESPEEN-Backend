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

import express, {Request, Response} from "express";
import axios from "axios";
import dotenv from "dotenv";
import User from "../models/userModel";
import {API} from "../utils/interfaces";
import {createAndUpdateApiKey} from "../controllers/apiKeyController";
import ApiKey from "../models/apiKeyModels";
import {getFormattedToken} from "../utils/token";

const clientId = process.env.GITHUB_CLIENT_ID!;
const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
const redirectUri = "http://localhost:8080/api/github/callback";
let previousPushesID: any[] = [];

const githubRouter = express.Router();
dotenv.config();

async function getPushEvents(user_uid: string) {
    try {
        const tokens = await ApiKey.findOne({ user_id: user_uid, service: "github" });
        if (!tokens || !tokens.api_key) {
            console.error("No tokens found for user:", user_uid);
            return null;
        }
        const userResponse: any = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokens.api_key}`,
            },
        });

        const response: any = await axios.get(`https://api.github.com/users/${userResponse.data.login}/events`, {
            headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        });
        const pushes = response.data.filter((event: any) => event.type === 'PushEvent');

        const newPushes = pushes.filter((obj: any) => obj.id && !previousPushesID.includes(obj.id));
        if (newPushes.length <= 0) {
            console.log('No new pushes');
            return;
        }
        previousPushesID += newPushes.map((obj: any) => obj.id);
        const push = newPushes[0];

        let message: any = {};
        message["user_uid"] = user_uid;
        message["data"] = `Push detected on ${push.repo.name} by ${push.payload.commits[0].author.name} with message: ${push.payload.commits[0].message}`;
        return message;
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return [];
    }
}

export class GithubRoutes implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([
        ["push_events", getPushEvents],
    ]);

    async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        if (!this.RouteMap.has(routes)) return null;
        const route = this.RouteMap.get(name);
        if (route === undefined) return null;
        if (name === "push_events") return await route(user_uid);
        if (params) return await route(params);
        return await route();
    }
}

githubRouter.get("/github/auth", (req: Request, res: Response) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
    res.redirect(githubAuthUrl);
});

githubRouter.get("/github/callback", async (req: Request, res: Response) => {
    const code = req.query.code;
    const authHeader = req.cookies.authToken;

    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    if (!code) {
        return res.status(400).send("Code de validation manquant");
    }
    const userToken = await User.findOne({ user_token: authHeader });

    if (!userToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const user_uid = userToken.uid;
    res.redirect(`http://localhost:3000/services`);
    try {
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
            },
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        const { access_token }: any = tokenResponse.data;

        if (access_token) {
            await axios.get("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            await createAndUpdateApiKey(access_token, "", user_uid, "github");
            return;
        } else {
            return res.status(500).send("Échec de l'obtention de l'access_token");
        }
    } catch (error) {
        console.error("Erreur lors de l'authentification GitHub :", error);
        return res.status(500).send("Erreur lors de l'authentification GitHub");
    }
});

githubRouter.get("/github/logout", async (req: Request, res: Response) => {
    try {
        const authHeader = getFormattedToken(req);
        const userToken = await ApiKey.deleteOne({user_token: authHeader, service: "github"});
        if (!userToken) {
            return res.status(401).json({error: "Unauthorized"});
        }
        return res.status(200).redirect("http://localhost:3000/services");
    } catch (error) {
        console.error("Error in /api/github/logout route:", error);
        return res.status(500).json({error: "Failed to process user"});
    }
});

export default githubRouter;
