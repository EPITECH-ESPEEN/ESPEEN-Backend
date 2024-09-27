import { Response } from "express";

export default (user: any, statusCode: number, res: Response) => {
  const token = user.getJWTToken();
  const cookieExpiresTime = Number(process.env.COOKIE_EXPIRES_TIME) || 1;
  const options = {
    expires: new Date(Date.now() + cookieExpiresTime * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    token,
  });
};
