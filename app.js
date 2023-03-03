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
  email: String,
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

app.get("/test", function(req,res){
  if(req.isAuthenticated()){
    res.render("test");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  User.register({email: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req,res, function(){
        res.redirect("/test");
      });
    }
  });

});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local");
      res.redirect("/test");
    }
  })

  User.findOne({email:username})
    .then((foundUser) => {
        if(foundUser){
            if(foundUser.password === password){
                res.redirect("test");
            }
            else{
              res.redirect("/register");
            }
        }
   })
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
});