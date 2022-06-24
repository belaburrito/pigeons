const mongoose = require('mongoose'),
passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
User = require('./db');

//passport.use(new LocalStrategy(User.authenticate()));

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
));

passport.use(User.createStrategy());


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

