import fetch from 'node-fetch';
import ApiKey from '../models/apiKeyModels';
import { API } from "../utils/interfaces";

const API_KEY = process.env.YOUTUBE_API_KEY;

interface ChannelInfo {
    id: string;
    name: string;
}

const getSubscribedChannels = async (user_uid: string): Promise<ChannelInfo[]> => {
    const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&key=${API_KEY}`;
    const token = await ApiKey.findOne({ user_id: user_uid, service: "google" });
    const channels: ChannelInfo[] = [];

    if (!token?.api_key) {
        console.error("API key not found for user.");
        return channels;
    }

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token.api_key}`,
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();

        if (data.items) {
            for (const item of data.items) {
                const channelId = item.snippet.resourceId.channelId;
                const channelName = item.snippet.title;
                channels.push({ id: channelId, name: channelName });
            }
        }
    } catch (error) {
        console.error("Error fetching subscribed channels:", error);
    }

    return channels;
};

const getRecentVideos = async (channelId: string) => {
    const twoMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&order=date&part=snippet&type=video&publishedAfter=${twoMinutesAgo}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items;
        }
    } catch (error) {
        console.error(`Error fetching videos for channel ${channelId}:`, error);
    }

    return null;
};

export async function checkRecentVideosFromSubscriptions(user_uid: string) {
    const channels = await getSubscribedChannels(user_uid);
    const videoData: Array<{ channelName: string; channelId: string; videos: Array<{ title: string; videoId: string }> }> = [];

    for (const { id: channelId, name: channelName } of channels) {
        const recentVideos = await getRecentVideos(channelId);

        if (recentVideos && recentVideos.length > 0) {
            const videos = recentVideos.map((video: any) => ({
                title: video.snippet.title,
                videoId: video.id.videoId,
            }));
            videoData.push({ channelName, channelId, videos });
        }
    }
    const message = {
        data: videoData,
        user_uid: user_uid
    };
    return message;
}



export class YoutubeRoutes implements API {
    ApiMap: Map<string, API> = new Map<string, API>();
    RouteMap: Map<string, Function> = new Map<string, Function>([
        ["new_video", checkRecentVideosFromSubscriptions],
    ]);

    async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
        if (!this.RouteMap.has(routes)) return null;
        const route = this.RouteMap.get(name);
        if (route === undefined) return null;
        if (name === "new_video") return await route(user_uid);
        if (params) return await route(params);
        return await route();
    }
}
