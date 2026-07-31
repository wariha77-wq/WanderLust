if(process.env.NODE_ENV != "production"){ //as for when we enter production level
 require("dotenv").config();
}
// console.log(process.env.SECRET); //.env variables ko access krrhe

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
    console.log("connected successfully");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(mongo_url);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")))

const sessionOpts = {
    secret: "code",
    resave:false,
    saveUninitialized:true,  
    cookie:{
       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // days * hours * min * secs * milsecs
       maxAge: 7 * 24 * 60 * 60 * 1000,
       httpOnly: true // for security purposes cross scripting attacks
    }
};

app.get("/",(req,res)=>{
    res.send("Hi!");
})

app.use(session(sessionOpts));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


app.use("/listings",listingRouter);           // Flash() should be used before these routes 
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*splat",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500,message="Something went wrong!"} = err; 
    res.status(statusCode).render("error.ejs",{message});
})

const port = 8080;
app.listen(port,()=>{
    console.log("Server is listening");
})