var express = require('express');
var app = express();
var docker = require('./docker');

app.use('/docker', docker);

module.exports = app;