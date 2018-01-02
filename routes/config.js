
var config = function () {};

var bcrypt = require('bcrypt');
var mongoose = require("mongoose");
var moment = require('moment');
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
mongoose.Promise = require('bluebird');
var uniqueValidator = require('mongoose-unique-validator');
//mongoose.connection.openUri("mongodb://localhost:27017/test3");
config.passport = passport;
var request = require('request');
config.request = request;


mongoose.connection.openUri('mongodb://root:4dark@localhost/test3?authSource=admin');
const isReachable = require('is-reachable');
config.isReachable =  isReachable;
var CryptoJS = require("crypto-js");
const AutoIncrement = require('mongoose-sequence')(mongoose);
config.AutoIncrement = AutoIncrement;
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
     console.log("Connection succeeded.");
   });
   config.isMysql = true;
   var Schema = mongoose.Schema;

   var userSchema = new Schema({
    id:{type: Schema.Types.Number},
    username: { type: Schema.Types.String,  required: true, trim: true, unique: true,ref: 'username'},
    password:{type: Schema.Types.String},
    email:{type: Schema.Types.String, trim: true,unique: true},
   date: { type: Date, default: Date.now },
   token: {type: String},
  // tokenDate: {type: Date}
  createDate: {type: Date,default:null},
  admin:{type:Schema.Types.Boolean},
  moderator:{type:Schema.Types.Boolean},
  ban:{
    isBanned:{type:Schema.Types.Boolean},
    reason:{type:Schema.Types.String}
  }
 });
 



 userSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({ username: username})
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

userSchema.methods.validPassword = function(password) {
  var user = this;

  return bcrypt.compareSync(password, user.password);
};


 userSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});
 userSchema.plugin(AutoIncrement, {inc_field: 'id'});
 userSchema.plugin(uniqueValidator);

 var UserData = mongoose.model("userData", userSchema)
 config.UserData = UserData;
 
 passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {

  UserData.findOne({ 'username': id }, function(err, user) {
    return done(err, user);
  });


});
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//function randomString (len) {
    config.randomString = function (len,ip) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }
  var x  = CryptoJS.AES.encrypt(ip, 'Game$');
  buf.push('.');
  buf.push(x);
  return buf.join('');

};


passport.use(new LocalStrategy({
  // by default, local strategy uses username
  usernameField: 'inputUser',
  passwordField: 'inputPassword',
  passReqToCallback : true
},
function(req, username, password, done) {
  

  // asynchronous
  process.nextTick(function() {
      UserData.findOne({ 'username' :  username }, function(err, user) {
          // if there are any errors, return the error
          if (err)
              return done(err);

          // if no user is found, return the message
          if (!user)
              return done(null, false, req.flash('loginMessage', 'No user found.'));

          if (!user.validPassword(password))
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

          // all is well, return user
          else
              return done(null, user);
      });
  });

}));

var mysql      = require('mysql');
config.mysql = mysql;
config.connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '4dark',
  database : 'sames'
});
//needs testing...
config.connection.connect(function(err) {
  if(err)
  console.log(err);
 console.log('conn...');

});


function test2(name) {
  // return is important - you're returning the promise which you will use later.
  
  return UserData.findOne({'token': name})
      .then(function(user) {
        if(user === null || user.token===null){
        return -1;
         } else{
         /* console.log('banned: '+user.ban.isBanned +' user: '+user.username);
           if(user.ban.isBanned){
           return 'banned';
         
            } else  */
          return user.token;
        }
      })
      .catch(function(err) {
          console.log(err);
      });
  }
  config.isAuthenticated = function (req,res,next) {
//function isAuthenticated(req,res,next){
  if(req.session.user!=undefined)
  return  test2(req.session.user)
  .then(function(token) {

  
     
      var isLog = false;
      if(req.session.user!= undefined || req.session.user===token){
          isLog=true;
      }
      else if(req.cookies.remember_me === token){
          isLog=true;
      }
     else if(token===-1 && req.session.user== undefined ){
        isLog=false;
      }
    /* if(token==='banned'){
      isLog=false;
      req.session.isBanned=true;
      console.log('first banned');
      }*/
     
      return isLog
  })  
  else if(req.cookies.remember_me!=undefined)
  return test2(req.cookies.remember_me)
  .then(function(token) {
   
      var isLog = false;
      if(req.session.user!= undefined && req.session.user===token){
          isLog=true;
      }
      else if(req.cookies.remember_me === token){
          isLog=true;
      }
     else if(token===-1 && req.session.user== undefined  ){
        isLog=false;
      }
     /* if(token==='banned'){
        isLog=false;
        req.session.isBanned=true;
        console.log('2nd banned');
        
        }*/
      if(isLog && req.session.user === undefined){
        console.log('inside renew token');
      
///test

return UserData.findOne({ 'token' : token}, function(err, user) {
  // if there are any errors, return the error
  if (err)
      return done('admin err: '+err);

      var ip = req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
      req.session.user = config.randomString(64,ip);

     var t  =  moment(user.createDate).add((30 * 24 * 60 * 60 * 1000),'seconds');
     var secondsDiff = t.diff(Date.now(), 'seconds');
      if(secondsDiff<=0){
        console.log('cookie expired!');
        res.clearCookie('remember_me');
        res.redirect('/');
      }
  
     console.log('exp: '+t+' diff: '+secondsDiff);
      res.cookie('remember_me', req.session.user,{ path: '/', httpOnly: true, expires:secondsDiff, maxAge: secondsDiff});




    var a = req.session.user.split('.');
      var bytes  = CryptoJS.AES.decrypt(a[1].toString(), 'Game$');
      var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    var b = user.token.split(".");
    var bytes1  = CryptoJS.AES.decrypt(b[1].toString(), 'Game$');
    var plaintext1 = bytes.toString(CryptoJS.enc.Utf8);
    
    if(plaintext!=plaintext1){
    isLog=false;
    res.clearCookie('remember_me');
    }
    else{
   

      console.log('reenter: '+user.moderator);
      req.session.admin = user.admin;
      req.session.moderator = user.moderator;
      
      UserData.update({'token': token}, {
        'token':req.session.user,
    }, function(err, numberAffected, rawResponse) {
       if(err)
       console.log('err '+err);
       console.log('renew token saved');
    })
  }
      return isLog//check
});

     

      //return isLog
      
      }
    
     
  })
  else
  return  test2(req.cookies.remember_me)
  .then(function(token) {
      return false
  })    
}


process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
module.exports = config;