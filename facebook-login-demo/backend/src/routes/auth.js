import { Router } from "express";
import passport from "passport";

const router = Router();

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["public_profile"] }),
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.FRONTEND_URL}/?error=facebook_auth_failed`,
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  },
);

router.post("/logout", (req, res, next) => {
  req.logout((logoutErr) => {
    if (logoutErr) {
      return next(logoutErr);
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return next(sessionErr);
      }

      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out" });
    });
  });
});

export default router;
