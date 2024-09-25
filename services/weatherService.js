import axios from "axios";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

export const getCurrentWeather = catchAsyncErrors(async(req, res, next) => {
  try {
    const city = req.params.city;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f99fcdef37b5d1aba02e07f3d4b315f8`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données météorologiques' });
  }
});

