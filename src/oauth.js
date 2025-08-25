import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import db from "./db.js"; // tvoja SQLite baza

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => done(err, row));
});

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // traži usera u DB, kreiraj ako ne postoji
  let user;
  db.get("SELECT * FROM users WHERE email = ?", [profile.emails[0].value], (err, row) => {
    if (err) return done(err);
    if (row) user = row;
    else {
      const stmt = db.prepare("INSERT INTO users (name,email) VALUES (?,?)");
      stmt.run([profile.displayName, profile.emails[0].value], function(err) {
        if (err) return done(err);
        user = { id: this.lastID, name: profile.displayName, email: profile.emails[0].value };
        return done(null, user);
      });
    }
    if (user) return done(null, user);
  });
}));

// Facebook OAuth
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ["id", "displayName", "emails"]
}, (accessToken, refreshToken, profile, done) => {
  // isti princip kao Google
}));
