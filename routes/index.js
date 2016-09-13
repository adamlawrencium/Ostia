var express = require('express');
var router = express.Router();



// PROFILE SECTION =========================
router.get('/', function(req, res) {
  res.render('index',{
    data : req.data
  });
});

module.exports = router;
