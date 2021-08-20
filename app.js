/**
 * Performs the Authorization Code oAuth2 flow to authenticate Spotify Accounts
 * 
 */
var express = require('express'); // Express web server framework
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

// var home = require('./routes/home');
var callback = require('./routes/callback');
var login = require('./routes/login');
// var error = require('./routes/error');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())
  .use(logger('dev'))
  .use(express.json())
  .use(express.urlencoded({
    extended: false
  }));

// Routes
// app.use('/', home);
app.use('/callback', callback);
// app.use('/error', error);
app.use('/login', login);

// Error Handlers
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;