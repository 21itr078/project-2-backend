const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://pradeep:kongu2004@cluster1.y5ght6n.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

const User = mongoose.model('User', {
  googleId: String,
  email: String,
  name: String,
});

// Passport Setup
passport.use(new GoogleStrategy({
  clientID: '3050463972-5mlofl3m7ho1kjsop4cjinfhuq00de9h.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:5000/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  User.findOne({ googleId: profile.id }, async (err, existingUser) => {
    if (err) {
      return done(err);
    }

    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    });

    await newUser.save();
    done(null, newUser);
  });
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

// Google Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to the front end
    res.redirect('http://localhost:3000'); // Update with your React app URL
  }
);

// Logout Route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// Example protected route
app.get('/profile', ensureAuthenticated, (req, res) => {
  res.json(req.user);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
