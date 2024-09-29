import express from "express";
import passport from "passport";
import "./../middlewares/passport";
import isAuthenticated from "./../middlewares/userAuthentification";

const router = express.Router();

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  // Successful authentication, redirect home or to another route
  res.redirect("/");
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
