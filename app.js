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


mongoose.set('strictQuery', false);

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
  username:String,
  email: String,
  password: String,
  googleId: String,
});

const User = new mongoose.model("User", userSchema);

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
  res.render("test");
});

app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password 
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.redirect("/test");
    }
  })
});




app.listen(3000, function() {
    console.log("Server started on port 3000");
});