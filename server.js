var express = require('express'),
    exphbs = require('express-handlebars'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Swag = require('swag');


var funct = require('./functions.js');

var app = express();

//scripts routing
app.use('/scripts',express.static(__dirname + '/node_modules/'));

//js routing
app.use('/js',express.static(__dirname + '/js/'));

//content routing 
app.use('/content',express.static(__dirname + '/content/'));

//soundcloud callback html popu content
app.use('/sc',express.static(__dirname + '/content/sc'));

//angular app routing
app.use('/ng',express.static(__dirname + '/ng'));

//=======sign in strategy==========\\
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password, function(err, user) {
      if (err) {
		console.log(err.message);
		req.session.error = 'Incorrect Username and/or Password.';
		done(null,null);
	} else {
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in as ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please enter a valid username and password.'; //inform user could not log them in
        done(null, user);
      }
	}
})
}
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localReg(username, password, function(err, user){
	if (err) {
		req.session.error = 'A user with that name already exists.';
		done(null, null);
	} else {
		if (user) {
		//console.log("REGISTERED: " + user.username);
		        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
		        done(null, user);
		} 
	}
})
}
));

// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});


//========express=========\\
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

//======handlebars=======\\
// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main', //we will be creating this layout shortly
});

Swag.registerHelpers(hbs.handlebars);
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


//=====routes=====\\

//.......user registration / logins ......\\

//simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return True; }
  req.session.error = 'Please sign in!';
  res.redirect('/signin');
}

//displays our signup page
app.get('/signin', function(req, res){
  res.render('signin');
});


//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
	if (!req.user) {
		res.redirect('/signin');
	} else {
		var name = req.user.username;
		console.log("LOGGING OUT " + req.user.username)
		req.logout();
		res.redirect('/');
		req.session.notice = "You have successfully been logged out " + name + "!";
	}
});

//...........fun stuff............\\

//home
app.get('/', function(req, res){
	if (req.user) {
		res.render('home', {user: req.user});
	} else {
		console.log('1');
  		res.render('home');
	}
});


//poetry
app.get('/poetry', function(req, res){
	var poetry = funct.getPoetry(function(err, poems) {
		if (err) {res.render('home', {user: req.user});}
		else {
		        if (req.user) {
				if (poems) {
	        		        res.render('poetry', {user: req.user, poems : poems});
				} else {
					res.render('poetry', {user: req.user});
				}
			} else {
				res.render('poetry', {poems: poems});
			};
		};
	});
});

app.post('/newPoem',function(req,res){
	console.log('req:');
	console.log(req);
	console.log('res:');
	console.log(res);
	var insertPoem = funct.createPoem(req.body.title, req.body.body, function(err) {
		if (err) {req.session.error = "There was a problem adding the poem";}
		else {
			req.session.success = "Poem successfully posted.";
			var poetry = funct.getPoetry(function(err, poems) {
				if (req.user) {
					if (poems) {
	        			        res.render('poetry', {user: req.user, poems : poems});
					} else {
						res.render('poetry', {user: req.user});
						}
					} else {
						res.render('poetry', {poems: poems});
				};
			});
		};
	});
});


//soundcloud post
app.get('/bish', function(req, res) {
	if (req.user) {
		if (req.user.username == 'Bish') {
			req.session.success = "Logged ya in, ya bish!"
			soundcloud.initialize({
				client_id: 'YOUR_CLIENT_ID',
				redirect_uri: 'http://www.dimensionaladventurer.com/bish'
			});
			res.render('bish');
		} else {
			
			req.session.error = 'Your login credentials are `not proppa`';
			res.render('home');
		}
	} else {
		res.render('home');
	}
})

//============ stringGen ==============\\
app.get('/nameBot', function(req, res) {
	if (req.user) {
		res.render('nameBot');
	} else {
		req.session.error = 'Not enough cred. Try logging in.';
		res.render('home');
	}
});

app.post('/nameBot', function(req, res) {
	if (req.user) {
		console.log(req.body);
		funct.addWordToBag(req.body.word, function(err) {
			if (err) {
				req.session.error = 'Trouble adding word to the bag';
				res.render('nameBot');
			} else {
				req.session.success = 'Its all money in the bag'
				res.render('nameBot');
			}
		})
	} else {
		req.session.error = 'Not enough cred. Try logging in.';
		res.render('home');
	}

})

app.get('/wordBag', function(req, res) {
	if (req.user) {
		funct.getWordBag(function(err, wordBag) {
			if(err) {
				console.log(err);
				res.render('nameBot');
			} else {
				res.json(wordBag);
			}
		})
	} else {
		res.render('home');
	}
})

//===============PORT=================
var server = app.listen(80, function() {
	var host = server.address().address
	var port = server.address().port

	console.log("listening on " + port + "!");
});
