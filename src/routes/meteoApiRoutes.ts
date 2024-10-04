interface API {
  ApiMap: Map<string, API>;

  redirect_to(name: string, routes: string, params?: any): any;
}

export class MeteoApi implements API {
  ApiMap: Map<string, API> = new Map<string, API>();

  async redirect_to(name: string, routes: string, params?: any) {
    if (params === undefined) return null;
    try {
      const url = `https://api.weatherapi.com/v1/current.json?q=${params}&lang=fr&key=${process.env.WEATHER_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const weatherData = await response.json();
      console.log(weatherData);
      return weatherData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
