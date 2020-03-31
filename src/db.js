//db.js
// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more lists
const User = new mongoose.Schema({
  // username provided by authentication plugin
  // password hash provided by authentication plugin
  classes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'className' }]
});

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
const className = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  homeworks: [Homework],
  exams: [Exam]
});