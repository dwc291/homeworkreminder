//app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
require('./db');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const flash = require('express-flash');

const sessionOptions = { 
  secret: 'secret for signing session id', 
  saveUninitialized: false, 
  resave: false 
};
app.use(session(sessionOptions));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname,'..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const User = mongoose.model('User');
const Class = mongoose.model('Class');
const Homework = mongoose.model('Homework');
const Exam = mongoose.model('Exam');

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      bcrypt.compare(password, user.password, function(err, result){
        if(err){
          console.log('Error', err);
        }
        else{
          if (!user || !result) {
            return done(null, false, { message: 'Incorrect username or password' });
          }
          return done(null, user);
        }
      });
      
    });
  }
));

passport.serializeUser(function(user, done) {
  //const sessionUser = { _id: user._id, name: user.username};
  done(null, user.username);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/login', function(req, res){
  const message = req.flash();
  res.render('login', {loginMess: message['error'], signupMess: message['signup']});
});

app.post('/login', passport.authenticate('local', { 
  successRedirect: '/homeworks',
  failureRedirect: '/login',
  failureFlash: true 
}));

app.post('/signup', function(req, res){
  if(!req.body.username) {
    req.flash('signup', 'Username is required');
    res.redirect('login');
  }
  else if(!req.body.password) {
    req.flash('signup', 'Password is required');
    res.redirect('login');
  }
  else if(!(req.body.password === req.body.passwordcheck)) {
    req.flash('signup', 'Passwords do not match');
    res.redirect('login');
  }
  else {
    User.findOne({username: req.body.username}, function(err, obj){
      if(err){
        console.log('Error', err);
      }
      else{
        if(obj) {
          req.flash('signup', 'Username already exists');
          res.redirect('login');
        }
        else{
          req.flash('signup', 'Account successfully created');
          bcrypt.hash(req.body.password, 10, function(err, hash){
            new User({
              username: req.body.username,
              password: hash
            }).save(function(err){
              console.log('Account successfully created.')
              res.redirect('/login');
            });
          });
        }
      }
    });
  }
});

app.get('/homeworks', function(req, res){
  res.render('homeworks');
});

app.get('/classes', function(req, res){
  User.findOne({username: req.user}, function(err, obj){
    const classes = obj['classes'];
    res.render('classes', {classes: classes});
  });
});

app.get('/classes/add', function(req, res){
  res.render('class-add');
});

app.post('/classes/add', function(req, res){
  User.findOneAndUpdate({username: req.user},
    {$push: 
      {classes: {
        name:req.body.class
      }}
    }, function(err, obj){
      res.redirect('/classes')
    }
  );
});

app.listen(3000);