import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";

export function configurePassport() {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "displayName", "photos", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const avatar = profile.photos?.[0]?.value || "";

          let user = await User.findOne({ facebookId: profile.id });

          if (!user) {
            user = await User.create({
              facebookId: profile.id,
              displayName: profile.displayName || "Facebook User",
              email,
              avatar,
            });
          } else {
            user.displayName = profile.displayName || user.displayName;
            user.email = email || user.email;
            user.avatar = avatar || user.avatar;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });
}
