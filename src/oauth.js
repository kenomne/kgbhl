import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import db from "../db.js"; // tvoja baza

// Serialize / deserialize korisnika (čuva u sesiji)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    done(err, row || null);
  });
});

// Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;

      if (!email) return done(new Error("No email from Google"));

      // Proveri da li korisnik postoji
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return done(err);

        if (row) {
          // postoji -> login
          return done(null, row);
        } else {
          // kreiraj novog korisnika
          const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
          stmt.run([name, email], function (err) {
            if (err) return done(err);
            db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err2, newUser) => {
              done(err2, newUser);
            });
          });
        }
      });
    }
  )
);

// Facebook OAuth
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails"],
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;

      if (!email) return done(new Error("No email from Facebook"));

      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return done(err);

        if (row) {
          return done(null, row);
        } else {
          const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
          stmt.run([name, email], function (err) {
            if (err) return done(err);
            db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err2, newUser) => {
              done(err2, newUser);
            });
          });
        }
      });
    }
  )
);

export default passport;
