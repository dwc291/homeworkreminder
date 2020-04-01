//app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
require('./db');
const mongoose = require('mongoose');
const passport = require('passport');

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));