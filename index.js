const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
require('dotenv').config();

const app = express();

// Configure session middleware
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport with Google strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (token, tokenSecret, profile, done) => {
        // Here you would handle user data, e.g., save it to the database
        return done(null, profile);
    }));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile');
    }
);


app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.send(`<button><a href="/auth/google">Login</a>`);
    }
    // console.log(req.user); // Add this line to log the user object
    res.send(`<h1>Welcome, ${req.user.displayName}</h1><a href="/logout">Logout</a><br><button><a = href="profile/user">GO TO USER</a></button>`);

});

app.get('/profile/user', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.send('First Sign in');
    }
    res.send(`<blockquote>Heyyy baby</blockquote>`)
})

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});