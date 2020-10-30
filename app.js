require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('src'));
app.use(bodyParser.urlencoded({ extended: false }))

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

// SETUP DB connection
mongoose.connect(`mongodb+srv://practice:${process.env.MONGODB_PASSWORD}@cluster0.hrhid.mongodb.net/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

app.get('/', (req, res) => {
    res.render("index");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
