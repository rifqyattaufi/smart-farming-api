const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../model/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userData = {
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar_url: profile.photos?.[0]?.value,
        };

        return done(null, userData);
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error, null);
      }
    }
  )
);
