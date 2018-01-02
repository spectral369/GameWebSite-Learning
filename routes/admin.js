
var express = require('express');
var router = express.Router();

var conf = require('./config.js');



router.get('/',function(req,res,next){
    if(req.session.admin && req.session.user!=undefined)
  res.render('admin',{
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



router.post('/ban',function(req,res,next){

   conf.UserData.update({'username': req.body.un}, {
        'ban.isBanned':true,
        'ban.reason':req.body.reason,
        'token':''
    }, function(err, numberAffected, rawResponse) {
       if(err){
       console.log('err '+err);
       res.end(JSON.stringify('error'));
       }
       console.log('ban success')
       //res.clearCookie('remember_me');//test
       var resp = {
         success:true,
         reason:req.body.reason
       }
       res.end(JSON.stringify(resp));
    })
});


router.post('/unban',function(req,res,next){
  conf.UserData.update({'username': req.body.un}, {
    'ban.isBanned':false,
}, function(err, numberAffected, rawResponse) {
   if(err){
   console.log('err '+err);
   res.end(JSON.stringify('error'));
   }
   console.log('unban success')
   res.end(JSON.stringify('success'));
})
});

module.exports = router;