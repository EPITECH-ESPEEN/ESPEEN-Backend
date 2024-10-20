import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";

export const discordMessageWebhook = catchAsyncErrors(async (req, res, next) => {
  const { message, webhookUrl } = req.body;
  if (!message || !webhookUrl) {
    return next(new ErrorHandler("Missing message or webhookUrl", 400));
  }
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });
  if (!response.ok) {
    return next(new ErrorHandler("Error while sending message to Discord", 500));
  }
  res.status(200).json({ success: true });
});
