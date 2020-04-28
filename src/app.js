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

let idCounter = 1;

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

app.get('/', function(req,res){
  if(req.isAuthenticated()){
    res.redirect('/homeworks');
  }
  else{
    res.redirect('/login');
  }
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
              res.redirect('/login');
            });
          });
        }
      }
    });
  }
});

app.get('/homeworks', function(req, res){
  if(req.isAuthenticated()){
    User.findOne({username: req.user}, function(err, obj){
      const classes = obj['classes'];
      let homeworks = obj['homeworks'];
      let homeworksSorted = [];
      for(let i=0; i<obj['homeworks'].length; i++){
        if(req.query.class === homeworks[i].class|| req.query.class === "All" || req.query.class === undefined){
          if(!homeworks[i].checked){
            homeworksSorted.push(homeworks[i]);
          }
        }
      }
      homeworks = homeworksSorted.sort((a,b) => b.dueDate - a.dueDate);
      res.render('homeworks', {homeworks: homeworks, classes: classes});
    });
  }
  else{
    res.render('unauthorized');
  }
});

app.get('/homeworks/add', function(req, res){
  if(req.isAuthenticated()){
    User.findOne({username: req.user}, function(err, obj){
      const message = req.flash();
      const classes = obj['classes'];
      res.render('homework-add', {classes: classes, formMess: message['form']});
    });
  }
  else{
    res.render('unauthorized');
  }
});

app.post('/homeworks/add', function(req, res){
  const re = new RegExp("^(((0?[1-9]|1[012])/(0?[1-9]|1\\d|2[0-8])|(0?[13456789]|1[012])/(29|30)|(0?[13578]|1[02])/31)/(19|[2-9]\\d)\\d{2}|0?2/29/((19|[2-9]\\d)(0[48]|[2468][048]|[13579][26])|(([2468][048]|[3579][26])00)))$");
  if(!req.body.class){
    req.flash('form', 'Fields cannot be empty');
    res.redirect('/homeworks/add');
  }
  else if(!req.body.homework){
    req.flash('form', 'Fields cannot be empty');
    res.redirect('/homeworks/add');
  }
  else if(!req.body.duedate){
    req.flash('form', 'Fields cannot be empty');
    res.redirect('/homeworks/add');
  }
  else if(!re.test(req.body.duedate)){
    req.flash('form', 'Invalid date');
    res.redirect('/homeworks/add');
  }
  else{
    User.findOneAndUpdate({username: req.user},
      {$push: 
        {homeworks: {
          _id: idCounter,
          class: req.body.class,
          name: req.body.homework,
          dueDate: req.body.duedate,
          checked: false
        }}
      }, function(err, obj){
        idCounter ++;
        res.redirect('/homeworks')
      }
    );
  }
});

app.post('/homeworks/update', function(req,res){
  if(!Array.isArray(req.body.checked)){
    User.findOneAndUpdate({username: req.user, 'homeworks._id':req.body.checked}, {$set :
      {'homeworks.$.checked': true}}, function(err, obj){
        console.log(obj);
      });
    res.redirect('/homeworks');
  }
  else{
    req.body.checked.forEach(function(id) {
      User.findOneAndUpdate({username: req.user, 'homeworks._id':id}, {$set :
        {'homeworks.$.checked': true}}, function(err, obj){
          console.log(obj);
        });
    });
    res.redirect('/homeworks');
  }
});

app.get('/exams', function(req, res){
  if(req.isAuthenticated()){
    User.findOne({username: req.user}, function(err, obj){
      const classes = obj['classes'];
      let exams = obj['exams'];
      let examsSorted = [];
      for(let i=0; i<obj['exams'].length; i++){
        if(req.query.class === exams[i].class || req.query.class === "All" || req.query.class === undefined){
          if(!exams[i].checked){
            examsSorted.push(exams[i]);
          }
        }
      }
      exams = examsSorted.sort((a,b) => b.date - a.date);
      res.render('exams', {exams: exams, classes: classes});
    });
  }
  else{
    res.render('unauthorized');
  }
});

app.get('/exams/add', function(req, res){
  if(req.isAuthenticated()){
    User.findOne({username: req.user}, function(err, obj){
      const message = req.flash();
      const classes = obj['classes'];
      res.render('exam-add', {classes: classes, formMess: message['form']});
    });
  }
  else{
    res.render('unauthorized');
  }
});

app.post('/exams/add', function(req, res){
  const re = new RegExp("^(((0?[1-9]|1[012])/(0?[1-9]|1\\d|2[0-8])|(0?[13456789]|1[012])/(29|30)|(0?[13578]|1[02])/31)/(19|[2-9]\\d)\\d{2}|0?2/29/((19|[2-9]\\d)(0[48]|[2468][048]|[13579][26])|(([2468][048]|[3579][26])00)))$");
  if(!req.body.class){
    req.flash('form', 'Fields cannot be empty');
    res.redirect('/exams/add');
  }
  else if(!req.body.exam){
    req.flash('form', 'Fields cannot be empty');
    res.redirect('/exams/add');
  }
  else if(!req.body.date){
    req.flash('form', 'Fields cannot be empty');
    res.redirect('/exams/add');
  }
  else if(!re.test(req.body.date)){
    req.flash('form', 'Invalid date');
    res.redirect('/exams/add');
  }
  else{
    User.findOneAndUpdate({username: req.user},
      {$push: 
        {exams: {
          _id: idCounter,
          class: req.body.class,
          name: req.body.exam,
          date: req.body.date,
          checked: false
        }}
      }, function(err, obj){
        idCounter ++;
        res.redirect('/exams')
      }
    );
  }
});

app.post('/exams/update', function(req,res){
  if(!Array.isArray(req.body.checked)){
    User.findOneAndUpdate({username: req.user, 'exams._id':req.body.checked}, {$set :
      {'exams.$.checked': true}}, function(err,obj){
        console.log(obj);
      });
    res.redirect('/exams');
  }
  else{
    req.body.checked.forEach(function(id) {
      User.findOneAndUpdate({username: req.user, 'exams._id':id}, {$set :
        {'exams.$.checked': true}}, function(err, obj){
          console.log(obj);
        });
    });
    res.redirect('/exams');
  }
});

app.get('/classes', function(req, res){
  if(req.isAuthenticated()){
    User.findOne({username: req.user}, function(err, obj){
      const classes = obj['classes'];
      res.render('classes', {classes: classes});
    });
  }
  else{
    res.render('unauthorized');
  }
});

app.get('/classes/add', function(req, res){
  if(req.isAuthenticated()){
    const message = req.flash();
    res.render('class-add', {formMess: message['form']});
  }
  else{
    res.render('unauthorized');
  }
});

app.post('/classes/add', function(req, res){
  if(!req.body.class){
    req.flash('form', 'Fields cannot be empty');
    res.redirect('/classes/add');
  }
  else{
    User.findOneAndUpdate({username: req.user},
      {$push: 
        {classes: {
          name:req.body.class
        }}
      }, function(err, obj){
        res.redirect('/classes')
      }
    );
  }
});

app.get("/logout", function(req, res){
  req.logOut();
  res.redirect('/login');
});

app.listen(process.env.PORT || 3000);