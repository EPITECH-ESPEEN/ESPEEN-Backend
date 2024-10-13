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

import { APIRouter } from "../routes/googleApiRoutes";
import User from "../models/userModel";
import apiKeyModels from "../models/apiKeyModels";

export async function isAuthToGoogle(user_uid: number) {
  const tokens = await apiKeyModels.find({ user: user_uid });
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

export function serviceRouter() {
  const routerAPI = new APIRouter();
  setInterval(async () => {
    const users = await User.find({});
    for (let i = 0; i < users.length; i++) {
      let user_services: { [key: string]: string } | undefined = users[i].actionReaction;
      if (user_services === undefined) {
        return;
      }
      for (let user_service in user_services) {
        switch (user_service.split(".")[0]) {
          case "google":
            if (!await isAuthToGoogle(i)) {
              return;
            }
            break;
          case "meteo":
            break;
          default:
            return;
        }
        let results: any | undefined = undefined;
        let access_token: string | undefined = undefined;

        for (let key in user_services) {
          const apiKeyDoc = await apiKeyModels.findOne({ user: users[i].uid, service: user_services[key].split(".")[0] }).select("api_key");
          if (apiKeyDoc) {
            access_token = apiKeyDoc.api_key;
          }
          let service: string[] = user_services[key].split(".");
          if (results === undefined) {
            results = await routerAPI.redirect_to(service[0], user_services[key].replace(service[0] + ".", ""), undefined, access_token, users[i].uid);
          } else {
            results = await routerAPI.redirect_to(service[0], user_services[key].replace(service[0] + ".", ""), results, access_token, users[i].uid);
          }
        }
      }
    }
  }, 5000);
}
