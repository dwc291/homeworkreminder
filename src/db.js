//db.js
const mongoose = require('mongoose');

// homeworks within a class
// * includes the due date of the homework
// * homeworks can be checked off when done
const Homework = new mongoose.Schema({
  name: {type: String, required: true},
  dueDate: {type: Date, required: true},
  checked: {type: Boolean, default: false, required: true}
});

// exams within a class
// * includes the date of the exam
// * exams can be checked off when done
const Exam = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true},
    checked: {type: Boolean, default: false, required: true}
});

// a class list
// * each list must have a related user
// * a list can have 0 or more homeworks or exams
const Class = new mongoose.Schema({
  name: {type: String, required: true},
  homeworks: [Homework],
  exams: [Exam]
});

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more lists
const User = new mongoose.Schema({
  username: String,
  password: String,
  classes:  [Class]
});

mongoose.model('User', User);
mongoose.model('Class', Class);
mongoose.model('Homework', Homework);
mongoose.model('Exam', Exam);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
// if we're in PRODUCTION mode, then read the configration from a file
// use blocking file io to do this...
    const fs = require('fs');
    const path = require('path');
    const fn = path.join(__dirname, '../config.json');
    const data = fs.readFileSync(fn);

// our configuration file will be in json, so parse it and set the
// conenction string appropriately!
    const conf = JSON.parse(data);
    dbconf = conf.dbconf;
} 
else {
// if we're not in PRODUCTION mode, then use
    dbconf = 'mongodb://localhost/finalProject';
}

mongoose.connect(dbconf);