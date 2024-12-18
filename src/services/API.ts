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

import { API } from "../utils/interfaces";
import { MeteoApi } from "./weatherServices";
import { GoogleApi, isAuthToGoogle } from "./googleServices";
import { DiscordApi } from "./discordServices";
import { TwitchApi } from "./twitchServices";
import { YoutubeApi } from "./youtubeServices";
import apiKeyModels from "../models/apiKeyModels";
import User from "../models/userModel";
import {GithubRoutes} from "./githubService";

export class APIRouter implements API {
  ApiMap: Map<string, API> = new Map<string, API>([
    ["google", new GoogleApi()],
    ["meteo", new MeteoApi()],
    ["discord", new DiscordApi()],
    ["twitch", new TwitchApi()],
    ["youtube", new YoutubeApi()],
    ["github", new GithubRoutes()]
  ]);

  redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    const service: string[] = routes.split(".");

    if (!this.ApiMap.has(name)) return null;
    if (params) return this.ApiMap.get(name)?.redirect_to(service[0], routes.replace(service[0] + ".", ""), params, access_token, user_uid);
    return this.ApiMap.get(name)?.redirect_to(service[0], routes.replace(service[0] + ".", ""), undefined, access_token, user_uid);
  }
}

export function serviceRouter() {
  const routerAPI = new APIRouter();
  setInterval(async () => {
    const users = await User.find({});
    for (let i = 0; i < users.length; i++) {
      let user_services: { [key: string]: string } | undefined = users[i].actionReaction;
      if (user_services === undefined) {
        break;
      }
      for (let user_service in user_services) {
        for (let key in user_services[user_service]) {
            switch (user_services[user_service][key].split(".")[0]) {
                case "google":
                if (!(await isAuthToGoogle(users[i].uid))) {
                    return;
                }
                break;
                case "meteo":
                case "discord":
                case "twitch":
                case "facebook":
                case "github":
                case "youtube":
                break;
                default:
                return;
            }
        }
      }
        for (let user_service in user_services) {
            const user_routes = user_services[user_service];
            console.log(user_routes);
        let results: any | undefined = undefined;
        let access_token: string | undefined = undefined;

        for (let key of user_routes) {
          const apiKeyDoc = await apiKeyModels.findOne({ user: users[i].uid, service: key.split(".")[0] }).select("api_key");
          if (apiKeyDoc) {
            access_token = apiKeyDoc.api_key;
          }
          let service: string[] = key.split(".");
          if (results === undefined) {
            results = await routerAPI.redirect_to(service[0], key.replace(service[0] + ".", ""), undefined, access_token, users[i].uid.toString());
          } else {
            results = await routerAPI.redirect_to(service[0], key.replace(service[0] + ".", ""), results, access_token, users[i].uid.toString());
          }
        }
      }
    }
  }, 20000);
}
