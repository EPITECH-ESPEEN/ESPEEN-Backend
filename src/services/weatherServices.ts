import axios from "axios";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { API } from "./API";

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

export class MeteoApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();

  async redirect_to(name: string, routes: string, params?: any, access_token?: string, user_uid?: string) {
    if (params === undefined) return null;
    try {
      const url = `https://api.weatherapi.com/v1/current.json?q=${params}&lang=fr&key=${process.env.WEATHER_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const weatherData = await response.json();
      let message = {};
      message["user_uid"] = user_uid;
      message["data"] = `La température actuelle à ${weatherData.location.name} est de ${weatherData.current.temp_c}°C.`;
      return message;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
