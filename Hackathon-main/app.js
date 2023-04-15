require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oidc');
var findOrCreate = require('mongoose-findorcreate');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "My little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
  username: String,
  password: String,
  googleId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// For my Google strategy 
passport.serializeUser(function(user, done) {
  process.nextTick(function() {
    done(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, done) {
  process.nextTick(function() {
    return done(null, user);
  });
});

passport.use('google',
new GoogleStrategy(
{
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/test",
  passReqToCallback:true
},
async (accessToken, refreshToken, profile, done) => {
  console.log(profile)
  const existingUser = await User.findOne({ googleId: profile.id });

  if (existingUser) { 
    done(null, existingUser);
  } else {
    const user = await new User({ googleId: profile.id, token: accessToken, name:profile.displayName }).save();
    done(null, user);
    }
  }
 )
);

app.get('/auth/google', 
  passport.authenticate("google", {scope: [ "profile"]}
));

app.get('/auth/google/test',
  passport.authenticate('google', { failureRedirect: "/login", failureMessage: true }),
  function(req, res) {
    res.redirect("/test" );
});


app.get("/", function(req,res){
  res.render("home");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/loginAs", function(req,res){
  res.render("loginAs");
});

app.get("/t_login", function(req,res){
  res.render("t_login");
});

app.get("/test", function(req,res){
  if(req.isAuthenticated()){
    res.render("test");
  } else {
    res.redirect("/login");
  }
});

app.use('/images/', express.static('./images'));

app.post("/register", function(req,res){
  User.register((
    {username: req.body.username,
    password: req.body.password
  }),
    req.body.password,
    (err, user) => {
    if (err) {
      console.log(err);
      console.log(req.body.username);
      console.log(req.body.password);
    } else {
      passport.authenticate('local')(req, res, () =>{
        res.redirect('/test');
        user.save();
      });
    }
  });
});

app.post("/login", function(req,res){
  const loginUsername = req.body.username;
const loginPassword = req.body.password;

User.findOne({username:loginUsername})
  .then((foundUser) => {
    if(foundUser){
      if(foundUser.password === loginPassword){
        // Use passport.authenticate() to authenticate the user
        passport.authenticate('local', function(err, user, info) {
          if (err) {
            console.log(err);
            res.redirect('/register');
          }
          if (!user) {
            console.log(info.message);
            res.redirect('/register');
          }
          req.login(user, function(err) {
            if (err) {
              console.log(err);
              res.redirect('/register');
            }
            // Redirect the user to the /test page if the login is successful
            res.redirect('/test');
          });
        })(req, res);
      } else {
        res.redirect('/register');
      }
    } else {
      res.redirect('/register');
    }
  })
  .catch((err) => {
    console.log(err);
    res.redirect('/register');
  });

});


app.post("/t_login", function(req,res){
  const loginUsername = req.body.username;
const loginPassword = req.body.password;

User.findOne({username:loginUsername})
  .then((foundUser) => {
    if(foundUser){
      if(foundUser.password === loginPassword){
        // Use passport.authenticate() to authenticate the user
        passport.authenticate('local', function(err, user, info) {
          if (err) {
            console.log(err);
            res.redirect('/register');
          }
          if (!user) {
            console.log(info.message);
            res.redirect('/register');
          }
          req.login(user, function(err) {
            if (err) {
              console.log(err);
              res.redirect('/register');
            }
            // Redirect the user to the /test page if the login is successful
            res.redirect('/test');
          });
        })(req, res);
      } else {
        res.redirect('/register');
      }
    } else {
      res.redirect('/register');
    }
  })
  .catch((err) => {
    console.log(err);
    res.redirect('/register');
  });

});




app.listen(3000, function() {
    console.log("Server started on port 3000");
});