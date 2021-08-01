/**
 * Performs the Authorization Code oAuth2 flow to authenticate Spotify Accounts
 * 
 */
var axios = require('axios');
var express = require('express'); // Express web server framework
var cors = require('cors');
var cookieParser = require('cookie-parser');
require('dotenv').config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

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

app.get('/callback/', async function (req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      new URLSearchParams([
        [error, 'state_mismatch']
      ]).toString());
  } else {
    res.clearCookie(stateKey);

    const postHeaders = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    try {
      let response = await axios({
        url: "https://accounts.spotify.com/api/token",
        method: "post",
        params: {
          client_id,
          client_secret,
          grant_type: "authorization_code",
          code,
          redirect_uri,
        },
        postHeaders,
      });

      // BEGIN AXIOS 


      if (response.status === 200) {
        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        const getUrl = "https://api.spotify.com/v1/me";

        const getHeaders = {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        };

        try {
          let getRes = await axios({
            method: "get",
            url: getUrl,
            getHeaders,
            params: {
              access_token,
              refresh_token,
            },
          });

          if (getRes.status === 200) {
            console.log("LOGIN SUCCESSFUL!", getRes.data);
          }

          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            new URLSearchParams([
              ['access_token', access_token],
              ['refresh_token', refresh_token]
            ]).toString()

          );
        } catch (err) {
          console.log(err);
        }
      } else {
        res.redirect('/#' +
          new URLSearchParams([
            [error, 'invalid_token']
          ]).toString()
        );
      }
    } catch (err) {
      console.log(err.response);
    }
  }
});

console.log('Listening on 8888');
app.listen(8888);