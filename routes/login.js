var express = require('express');
var router = express.Router();
var stateKey = 'spotify_auth_state';

var client_id = process.env.CLIENT_ID; // Your client id
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

var app = express();

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };


app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    let params = new URLSearchParams([
      ['response_type', 'code'],
      ['client_id', client_id],
      ['scope', scope],
      ['redirect_uri', redirect_uri],
      ['state', state]
    ]);
    res.redirect('https://accounts.spotify.com/authorize?' +
      params.toString())
  });

  module.exports = router;