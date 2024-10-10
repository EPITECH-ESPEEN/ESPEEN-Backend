import mongoose from "mongoose";

export interface IApiKey extends mongoose.Document {
  user_id: string;
  api_key: string;
  refresh_token: string;
  service: string;
}

const apiKeySchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, "User id is required"],
    },
    api_key: {
      type: String,
      required: [true, "Api key is required"],
    },
    refresh_token: {
      type: String,
      required: [true, "Refresh token is required"],
    },
    service: {
      type: String,
      required: [true, "Service is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IApiKey>("ApiKey", apiKeySchema);
