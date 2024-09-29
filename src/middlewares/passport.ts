import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/userModel";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("test 1");
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error("No email found in profile"), false);
        }
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        console.log("test 2");

        if (existingUser) {
          return done(null, existingUser);
        }
        console.log("test 3");

        // If the user doesn't exist, create a new user
        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: "TEMPpassword1234!!!",
          avatar: {
            public_id: profile.id,
            url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "",
          },
          role: "user",
        });
        console.log("test 4");
        done(null, newUser);
      } catch (err) {
        console.log("test 5");
        done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});
