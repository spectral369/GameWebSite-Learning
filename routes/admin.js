
var express = require('express');
var router = express.Router();

var conf = require('./config.js');



router.get('/', function (req, res, next) {
  if (req.session.admin && req.session.token != undefined)
    res.render('admin', {
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



router.post('/ban', function (req, res, next) {

  conf.UserData.update({ 'username': req.body.un }, {
    'ban.isBanned': true,
    'ban.reason': req.body.reason,
    'token': ''
  }, function (err, numberAffected, rawResponse) {
    if (err) {
      console.log('err ' + err);
      res.end(JSON.stringify('error'));
    }
    console.log('ban success')
    //res.clearCookie('remember_me');//test
    var resp = {
      success: true,
      reason: req.body.reason
    }
    res.end(JSON.stringify(resp));
  })
});


router.post('/unban', function (req, res, next) {
  conf.UserData.update({ 'username': req.body.un }, {
    'ban.isBanned': false,
  }, function (err, numberAffected, rawResponse) {
    if (err) {
      console.log('err ' + err);
      res.end(JSON.stringify('error'));
    }
    console.log('unban success')
    res.end(JSON.stringify('success'));
  })
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


router.post('/upPost',function(req,res,next){

  //conf.top.on('disconnected', function(err,top){

   
   
  // conf.reconnectForPosts() .then(function (database) {
    conf.reCon()
  .then(function(v) { // `delay` returns a promise
  var db2 = v;
  
   db2.collection('objects').find({uid:1,title:/ /}).sort({timestamp:-1}).limit(3).toArray(function(err, results) {
    if (err) return console.log(err)
    //console.log(results)

    conf.topics[0] = {
      title:results[0].title,
    partial:"http://localhost:4567/topic/"+results[0].slug,
    }
    if(results[1]!=undefined){
    conf.topics[1] = {
      title:results[1].title,
      partial:"http://localhost:4567/topic/"+results[1].slug
      }
    }else{
      conf.topics[1] = {
           title : "Post 2",
           partial:"/"
      }
      }
    if(results[2]!=undefined){
    conf.topics[2] = {title:results[2].title,
      partial:"http://localhost:4567/topic/"+results[2].slug
      }
    }else{
      conf.topics[2] = {
           title : "Post 3",
           partial:"/"
      }
      }
    console.log(conf.topics);
    
 })
 db2.close();
 res.end(JSON.stringify("Done"));
})
.catch(function(v) {
  // Or do something else if it is rejected 
  // (it would not happen in this example, since `reject` is not called).
  console.log('error '+v);
}); 
 // });
});

module.exports = router;