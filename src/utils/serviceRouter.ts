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

import {APIRouter, isAuthToGoogle} from "../routes/googleApiRoutes";

export function serviceRouter() {
    const routerAPI = new APIRouter();

    setInterval(async () => {
        if (!isAuthToGoogle) {
            console.log("Not authentificated to Google");
            return;
        }
        let user_services: string[] | undefined = ["google.gmail.recep_email", "meteo"]; // ! Ask to DB
        let results: any | undefined = undefined;

        // if (user_services === [] /*|| user_services === undefined */) {
        //     return;
        // }
        for (let i = 0; i < user_services.length; i++) {
            let service: string[] = user_services[i].split(".");
            if (results === undefined) {
                results = await routerAPI.redirect_to(service[0], user_services[i].replace(service[0] + ".", ""));
            } else {
                results = await routerAPI.redirect_to(service[0], user_services[i].replace(service[0] + ".", ""), results);
            }
        }
    }, 5000);
}
