import express from "express";
import passport from "passport";
import "./../middlewares/passport";
import isAuthenticated from "./../middlewares/userAuthentification";

const router = express.Router();

router.get("/services/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/services/auth/google/callback", passport.authenticate("google", { failureRedirect: "/about.json" }), async (req, res) => {
  if (req.user) {
    console.log(req.user);
    res.redirect("/");
  } else {
    console.log("No user found");
    res.redirect("/login");
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/profile", isAuthenticated, (req, res) => {
  res.json(req.user);
});

export default router;
