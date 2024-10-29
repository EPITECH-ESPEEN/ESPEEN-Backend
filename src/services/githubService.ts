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

const githubRouter = express.Router();
dotenv.config();

async function getPushEvents(user_uid: string) {
    try {
        const tokens = await ApiKey.findOne({ user_id: user_uid, service: "github" });
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokens}`,
            },
        });

        const { a, b, name, c } = userResponse.data;
        const response = await axios.get(`https://api.github.com/users/${name}/events`, {
            headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        });

        return response.data.filter((event: any) => event.type === 'PushEvent');
    } catch (error) {
        console.error('Erreur lors de la récupération des événements :', error);
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

        const { access_token } = tokenResponse.data;

        console.dir("Access token:", tokenResponse);
        console.log("Access token:", access_token);
        if (access_token) {
            const userResponse = await axios.get("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const userData = userResponse.data;
            await createAndUpdateApiKey(access_token, "", user_uid, "github");
            res.json({ message: "Authentification réussie", user: userData });
        } else {
            res.status(500).send("Échec de l'obtention de l'access_token");
        }
    } catch (error) {
        console.error("Erreur lors de l'authentification GitHub :", error);
        res.status(500).send("Erreur lors de l'authentification GitHub");
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
