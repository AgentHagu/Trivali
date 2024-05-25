var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:username', function(req, res, next) {
  const userName = req.params.username;
  res.render('users', {username : userName})
  // res.send('respond with a resource');
});

module.exports = router;
