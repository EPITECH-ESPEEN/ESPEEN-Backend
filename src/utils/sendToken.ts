import { Response } from "express";

export default (user: any, statusCode: number, res: Response) => {
  const token = user.getJWTToken();
  //TODO: Chose between JWT_EXPIRES_TIME and COOKIE_EXPIRES_TIME, having both is just irrelevent
  //==optional==
  // expire time is already added within the token itself, not _required_ to also add it here.
  // good practice but useless unoptimisation
  //== ==
  const cookieExpiresDate = new Date(Date.now() + (Number(process.env.JWT_EXPIRES_TIME) || 0));
  const options = {
    expires: new Date(cookieExpiresDate),
    httpOnly: true,
    //NOTE Do NOT add the following :
    // secure: true,
    // It would make the cookies unusable as long as we don't have httpS
  };

  //TODO Returning the token in the response _body_ is as irrelevent as unsecure
  // Already set in cookies \/
  res.status(statusCode).cookie("token", token, options).json({
    "status": "ok",
    "message": "Loggin successfull"
  });
};
