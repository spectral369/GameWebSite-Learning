var express = require('express');
var router = express.Router();
var conf = require('./config.js');

var contor = 0;
var toBeForumReg = {};

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(conf.dberr);
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {

    conf.isAuthenticated(req, res, next)
      .then(function (isLoggedin) {
        console.log(isLoggedin);
        if (isLoggedin) {
          res.render('index', {
            title: 'GameWebSite',
            usern: req.session.user,
            condition: true,
            usern: req.session.user,
            anyArray: [1, 2, 3],
            admin: req.session.admin,
            moderator: req.session.moderator,
            post1:conf.topics[0],
            post2:conf.topics[1],
            post3:conf.topics[2],

          });
        } else {
          if (req.session.badLogin === undefined)
            req.session.badLogin = false;
          res.render('index', {
            title: 'GameWebSite',
            condition: false,
            anyArray: [1, 2, 3],
            userNotFound: req.session.badLogin,
            post1:conf.topics[0],
            post2:conf.topics[1],
            post3:conf.topics[2],

          });
        }
      })
  }
});



router.post('/login', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.passport.authenticate('local', function (err, username, info) {
      if (err) { return next(err); }
      if (!username) {
        console.log('bad username/pass !!');
        req.session.badLogin = true;
        return res.redirect('/');

      }

      req.logIn(username, function (err) {
        if (err) { return next(err); }
        // console.log('is'+username);

        if (username.ban.isBanned) {
          //res.clearCookie('remember_me');//test
          res.send('this user is baneed!');
        } else {
          var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);
          var token = conf.randomString(64, ip);
          console.log('token: ' + token);
          req.session.user = username.username;

          if (req.body.remember) {

            res.cookie('remember_me', token, { path: '/', httpOnly: true, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), maxAge: 30 * 24 * 60 * 60 * 1000 });

            /* conf.UserData.update({'username': req.body.inputUser}, {
              'token':token,
              'createDate':Date.now()
          }, function(err, numberAffected, rawResponse) {
             if(err)
             console.log('err '+err);
          })*/


          }
          else {
            req.session.cookie.expires = false;///orig =false
          }
          conf.UserData.update({ 'username': req.body.inputUser }, {
            'token': token,
            'createDate': Date.now()
          }, function (err, numberAffected, rawResponse) {
            if (err)
              console.log('err ' + err);
          })




          req.session.token = token;
          conf.UserData.findOne({ 'username': req.body.inputUser }, function (err, user) {
            // if there are any errors, return the error
            if (err)
              return done('admin err: ' + err);
            //  req.session.admin=user.admin;

            if (user.admin || user.moderator) {

              req.session.save();
              res.render('index', {
                title: 'GameWebSite',
                condition: true,
                usern: req.session.user,
                admin: user.admin,
                moderator: user.moderator
              });
              req.session.admin = user.admin;
              req.session.moderator = user.moderator;
              req.session.user = user.username;
            }

            else {
              req.session.save();
              res.render('index', {
                title: 'GameWebSite',
                condition: true,
                usern: req.session.user,

              });
            }


          });


        }
      });

    })(req, res, next);
  }
});


router.get('/download', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.isAuthenticated(req, res, next)
      .then(function (isLoggedin) {
        if (isLoggedin) {
          res.render('index', {
            title: 'GameWebSite',
            condition: true,
            usern: req.session.user,
            dwnl: true,
            admin: req.session.admin,
            moderator: req.session.moderator
          });
        } else {
          res.render('index', {
            title: 'GameWebSite',
            condition: false,
            dwnl: true
          });
        }
      })
  }
});


router.get('/forgot', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.isAuthenticated(req, res, next)
      .then(function (isLoggedin) {
        if (isLoggedin) {
          res.redirect('/');
        } else {
          res.render('index', {
            title: 'GameWebSite',
            condition: false,
            forgot: true
          });
        }
      })
  }
});



router.get('/status', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.isAuthenticated(req, res, next)
      .then(function (isLoggedin) {
        if (isLoggedin) {

          res.render('index', {
            title: 'GameWebSite',
            condition: true,
            usern: req.session.user,
            sts: true,
            admin: req.session.admin,
            moderator: req.session.moderator
          });

        } else {
          res.render('index', {
            title: 'GameWebSite',
            condition: false,
            sts: false
          });
        }
      })

  }
});



router.get('/update', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.isReachable('localhost:4567').then(reachable => {
      if (reachable) {
        registerOnForumAfterDisconnect();
      }
      if (!conf.isMysql) {
        conf.connection = conf.mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '4dark',
          database: 'sames'
        });
      }
      conf.connection.on('error', function (err) {
        var repon = {
          mysql: false,
          forumSts: reachable

        }
        conf.isMysql = false;
        res.end(JSON.stringify(repon))

      });
      console.log(conf.connection.state);
      if (/*conf.connection.state == "disconnected" || conf.connection.state==="ECONNREFUSED"*/!conf.isMysql) {

        conf.connection.connect(function (err) {
          if (err) {
            console.log(err);
            conf.connection.end();
            conf.isMysql = false;
            var repon = {
              mysql: false,
              forumSts: reachable

            }
            res.end(JSON.stringify(repon))
          } else {
            console.log('conn...');
            conf.isMysql = true;
            var repon = {
              mysql: true,
              forumSts: reachable

            }
            res.end(JSON.stringify(repon))
          }
        });

      } else
        if (conf.connection.state == "authenticated") {
          var repon = {
            mysql: true,
            forumSts: reachable
          }


          res.end(JSON.stringify(repon))
        }

    })
  }

});


router.get('/register', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    res.render('index', {
      reg: true,
      title: 'GameWebSite'


    });
  }
});
router.post('/register', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    var ud = new conf.UserData({
      id: conf.AutoIncrement.next,
      username: username,
      password: password,
      email: email,
      token: null,
      date: new Date().toISOString(),
      admin: false,
      moderator: false,
      ban: {
        isBanned: false,
        reason: ""
      }
    });
    ud.save(function (error) {
      if (error) {
        if (error.errors.username)
          res.render('index', {
            reg: true,
            title: 'GameWebSite',
            erun: true
          });
        else if (error.errors.email)
          res.render('index', {
            reg: true,
            title: 'GameWebSite',
            erem: true
          });
      } else {
        //new test for forum
        conf.isReachable('localhost:4567').then(reachable => {
          if (reachable) {
            conf.request.post({
              url: 'http://localhost:4567/api/v1/users/',
              headers: {
                Authorization: "Bearer ad20dee6-7b72-47f8-a053-640e0e5d6345"
              },

              json: {
                _uid: 1,
                username: username,
                password: password,
                email: email
              },

            },
              function (error, response, body) {
                console.log(error);
                //console.log(response);
                console.log(body);
                res.redirect('/');
              });

          }
          else {
            //neeeds reimplementing and testing!
            toBeForumReg[contor] = {
              username: username,
              password: password,
              email: email,
            }
            contor = contor + 1;

            res.redirect('/');
          }
        });

        //new test for forum

      }
    });
  }
});



router.get('/chpass', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.isAuthenticated(req, res, next)
      .then(function (isLoggedin) {
        if (isLoggedin) {

          res.render('index', {
            title: 'GameWebSite',
            condition: true,
            usern: req.session.user,
            fgpass: true,
            admin: req.session.admin,
            moderator: req.session.moderator
          });

        } else {
          res.render('index', {
            title: 'GameWebSite',
            condition: false,
            //sts:false
          });
        }
      })

  }

});

router.post('/chPass', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.UserData.findOne({ 'token': req.cookies.remember_me }, function (err, user) {
      // if there are any errors, return the error
      if (err)
        //return done(err);
        console.log(err);

      if (!user.validPassword(req.body.currpassword)) {
        res.render('index', {
          title: 'GameWebSite',
          condition: true,
          usern: req.session.user,
          fgpass: true,
          wp: true,
          admin: req.session.admin,
          moderator: req.session.moderator

        });
      }
      else if (user.validPassword(req.body.password2)) {
        res.render('index', {
          title: 'GameWebSite',
          condition: true,
          usern: req.session.user,
          fgpass: true,
          sp: true,
          admin: req.session.admin,
          moderator: req.session.moderator

        });
      }
      else {
        bcrypt.hash(req.body.password2, 10, function (err, hash) {
          if (err) {
            console.log(err);
          }
          conf.UserData.update({ 'username': user.username }, {
            'password': hash,
          }, function (err, numberAffected, rawResponse) {
            if (err) {
              res.render('index', {
                title: 'GameWebSite',
                condition: true,
                usern: req.session.user,
                chmail: true,
                erre: true,
                admin: req.session.admin,
                moderator: req.session.moderator

              });

            } else
              res.render('index', {
                title: 'GameWebSite',
                condition: true,
                usern: req.session.user,
                pUp: true,
                admin: req.session.admin,
                moderator: req.session.moderator
              });
          });
        })
      }
    });
  }
});

router.get('/chmail', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.isAuthenticated(req, res, next)
      .then(function (isLoggedin) {
        if (isLoggedin) {

          res.render('index', {
            title: 'GameWebSite',
            condition: true,
            usern: req.session.user,
            chmail: true,
            admin: req.session.admin,
            moderator: req.session.moderator

          });

        } else {
          res.render('index', {
            title: 'GameWebSite',
            condition: false,
            /* admin:req.session.admin,
             moderator:req.session.moderator*/
            //sts:false
          });
        }
      })
  }
});


router.post('/chMail', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    conf.UserData.findOne({ 'token': req.cookies.remember_me }, function (err, user) {
      // if there are any errors, return the error
      if (err)
        return done(err);

      if (!user.validPassword(req.body.currpassword)) {
        res.render('index', {
          title: 'GameWebSite',
          condition: true,
          usern: req.session.user,
          chmail: true,
          wp: true,
          admin: req.session.admin,
          moderator: req.session.moderator


        });

      } else {
        conf.UserData.update({ 'username': user.username }, {
          'email': req.body.newmail,
        }, function (err, numberAffected, rawResponse) {
          if (err) {
            res.render('index', {
              title: 'GameWebSite',
              condition: true,
              usern: req.session.user,
              chmail: true,
              erre: true

            });

          } else

            res.render('index', {
              title: 'GameWebSite',
              condition: true,
              usern: req.session.user,
              eUp: true,
              admin: req.session.admin,
              moderator: req.session.moderator
            });
        });
      }

    });
  }
})
function registerOnForumAfterDisconnect() {
  if (contor > 0) {
    conf.isReachable('localhost:4567').then(reachable => {
      if (reachable) {
        for (var i = 0; i < contor; i++) {
          conf.request.post({
            url: 'http://localhost:4567/api/v1/users/',
            headers: {
              Authorization: "Bearer 2f226cd5-e5c4-4894-a7d8-203af00b2d06"
            },

            json: {
              _uid: 1,
              username: toBeForumReg[i].username,
              password: toBeForumReg[i].password,
              email: toBeForumReg[i].email
            },

          },
            function (error, response, body) {
              console.log(error);
              //console.log(response);
              console.log(body);
              // res.redirect('/');
            });

        }
        contor = 0;
      }
    });
  }
}

router.get('/logout', function (req, res, next) {
  if (conf.dberr) {
    res.send('<html><script>setTimeout(function() { location.reload(); }, 45000);</script><body>DB connection error...</body></html>');
  } else {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
    if (req.cookies.remember_me) {
      res.clearCookie('remember_me');
    }
  }
});

module.exports = router;
