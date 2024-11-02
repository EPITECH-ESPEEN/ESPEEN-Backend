export interface API {
    ApiMap: Map<string, API>;

    redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string): any;
}
