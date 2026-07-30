const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl,isLoggedIn} = require("../middleware.js");

const usersController = require("../controller/user.js");

//signup routes
router
  .route("/signup")
  .get(usersController.renderSignupForm)
  .post(wrapAsync(usersController.userSignup));


//login routes
router
  .route("/login")
  .get(usersController.renderLoginForm) 
  .post(saveRedirectUrl,  //saveRedirectUrl first saves the org path the logs in
    passport.authenticate("local",{failureRedirect : '/login',failureFlash : true }),
    usersController.saveUrl);

router.get("/logout",usersController.logout);

module.exports = router;
