require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('src'));
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

// SETUP DB connection
mongoose.connect(`mongodb+srv://practice:${process.env.MONGODB_PASSWORD}@cluster0.hrhid.mongodb.net/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use( new LocalStrategy({
        // use email instead of username
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, 
    (email, password, done) => {
        User.findOne({
            email: email
        }, (error, user) => {
            if (error) {
                return done(error);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Username or password incorrect'
                });
            }

            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get('/', (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register({username: req.body.email, fullName: req.body.fullName, active: false}, req.body.password, function(err, user) {
        
        if (err) { 
            console.log(err); 
        }
       
        //authenticate user and login
        var authenticate = User.authenticate();
        authenticate(req.body.email, req.body.password, function(err, result) {
            
            if (result) { 
                req.login(user, function(err) {
                    if (err) { 
                        console.log(err);
                        res.redirect("/register");
                    } else {
                        res.redirect("/home");
                    }
                    
                });
            } else {
                console.log(err);
                res.redirect("/")
            }
        
        });
    });
});

app.get("/home", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("home", {
            fullName: req.user.fullName
        });
    } else {
        res.redirect("/");
    }

});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
