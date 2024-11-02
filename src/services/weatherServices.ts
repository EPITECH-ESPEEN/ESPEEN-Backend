import axios from "axios";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { API } from "../utils/interfaces";
import User from "../models/userModel";
import ApiKey from "../models/apiKeyModels";

export const getCurrentWeather = catchAsyncErrors(async (req, res, next) => {
  try {
    const city = req.params.city;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f99fcdef37b5d1aba02e07f3d4b315f8`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des données météorologiques" });
  }
});

export const getWeather = async (message: any) => {
  try {
    const uid = message.user_uid;
    const user = await User.findOne({ uid: uid });
    console.log(user);
    if (!user) return message;
    const apiKey = await ApiKey.findOne({ user_id: uid, service: "meteo" });
    console.log(apiKey);
    if (!apiKey) return message;
    const city = apiKey.city;
    if (!city) return message;
    const url = `https://api.weatherapi.com/v1/current.json?q=${city}&lang=fr&key=${process.env.WEATHER_API_KEY}`;

    const response = await fetch(url);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const weatherData = await response.json();
    console.log(weatherData);
    let new_message: any = {};
    new_message["user_uid"] = message.user_uid;
    new_message["data"] = `La température actuelle à ${weatherData.location.name} est de ${weatherData.current.temp_c}°C.`;
    return new_message;
  } catch (error) {
    console.error(error);
    return message;
  }
}

export class MeteoApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();
  RouteMap: Map<string, Function> = new Map<string, Function>([
    ["get_weather", getWeather],
  ]);

  async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    if (!this.RouteMap.has(routes)) return null;
    const route = this.RouteMap.get(name);
    if (route === undefined) return null;
    if (params) return await route(params);
    return await route();
  }
}
