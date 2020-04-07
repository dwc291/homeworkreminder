//app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
require('./db');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname,'..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

const User = mongoose.model('User');
const Class = mongoose.model('Class');
const Homework = mongoose.model('Homework');
const Exam = mongoose.model('Exam');

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
));

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
}));

app.post('/signup', function(req, res){

});

app.get('/classes/add', function(req, res){
  res.render('class-add');
});

app.post('/classes/add', function(req, res){
  new Class({
    user: user,//to be implemented after authentication has been implemented
    name: req.body.Class
  }).save(function(err){
    if(err){
        console.log(err);
    }
    else{
        res.redirect('/classes');
    }
  });
});

app.listen(3000);