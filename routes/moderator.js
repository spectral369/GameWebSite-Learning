
var express = require('express');
var router = express.Router();

var conf = require('./config.js');



router.get('/',function(req,res,next){
    if(req.session.moderator && req.session.token!=undefined)
  res.render('moderator',{
    title: 'M2 AP',
    
  });
   else
   res.redirect('/');
})


router.post('/ser',function(req,res,next){
  

  //console.log(req.body.txt);
  /////like { $regex: '.*' + req.body.search + '.*' } 
 conf.UserData.findOne({ 'username' : req.body.txt}, function(err, user) {
    if(err)
    res.end(JSON.stringify('error'));
    else if(user === undefined || user ===null)
    res.end(JSON.stringify('nouser'));
    else{
    
      var response = {
        id:user.id,
        username:user.username,
        email:user.email,
        rdate:user.date,
        ban:{
          isBanned:user.ban.isBanned,
          reason:user.ban.reason,
        }
      }
      res.end(JSON.stringify(response));
    }


  });



});



module.exports = router;