var express = require('express');
var router = express.Router();

/* GET error page. */
router.get('/error', function(req, res, next) {
  res.render('error');
});

module.exports = router;