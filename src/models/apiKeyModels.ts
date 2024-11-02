import mongoose from "mongoose";

export interface IApiKey extends mongoose.Document {
  user_id: number;
  api_key: string;
  refresh_token: string;
  service: string;
  webhook?: string;
  channel?: string;
  description?: string;
}

const apiKeySchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
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
    webhook: {
        type: String,
        required: [false, "Webhooks is not required"],
    },
    channel: {
        type: String,
        required: [false, "Channel is not required"],
    },
    description: {
        type: String,
        required: [false, "Description is not required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IApiKey>("ApiKey", apiKeySchema);
