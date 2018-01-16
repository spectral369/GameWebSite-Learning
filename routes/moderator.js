
var express = require('express');
var router = express.Router();

var conf = require('./config.js');



router.get('/', function (req, res, next) {
  if (req.session.moderator && req.session.token != undefined)
    res.render('moderator', {
      title: 'M2 AP',

    });
  else
    res.redirect('/');
})


router.post('/ser', function (req, res, next) {


  //console.log(req.body.txt);
  /////like { $regex: '.*' + req.body.search + '.*' } 
  conf.UserData.findOne({ 'username': req.body.txt }, function (err, user) {
    if (err)
      res.end(JSON.stringify('error'));
    else if (user === undefined || user === null)
      res.end(JSON.stringify('nouser'));
    else {

      var response = {
        id: user.id,
        username: user.username,
        email: user.email,
        rdate: user.date,
        ban: {
          isBanned: user.ban.isBanned,
          reason: user.ban.reason,
        }
      }
      res.end(JSON.stringify(response));
    }


  });



});



router.post('/getall',function(req,res,next){
  conf.UserData.find({}, function(err, users) {
    if (err)
    res.end(JSON.stringify('error'));
  else if (users === undefined || users === null)
    res.end(JSON.stringify('nouser'));
  else {
    var userMap = {};
  
   
   var i = 0;
      users.forEach(function(user) {
        userMap['record'+i]={};
       userMap['record'+i].id=user.id;
       userMap['record'+i].username=user.username;
       userMap['record'+i].email=user.email;
       userMap['record'+i].date=user.date;
       userMap['record'+i].isBanned=user.ban.isBanned;
       userMap['record'+i].reason=user.ban.reason;
        i++;
      });
      res.end(JSON.stringify(userMap));
  
  }
  
  });
  
  });
  



module.exports = router;