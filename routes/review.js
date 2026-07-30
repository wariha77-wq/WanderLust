const express = require("express");
const router = express.Router({mergeParams: true}); //to use :id from route
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const {isLoggedIn,isAuthor} = require("../middleware.js");

const reviewsController = require("../controller/reviews.js")

const validateReview = (req,res,next) => {
   let {error} = reviewSchema.validate(req.body);
   if(error){
     let errMsg = error.details.map((el) => el.message).join(",");
     throw new ExpressError(400,errMsg);
   }else{
     next();
   }
}

//Reviews
//Post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewsController.newReview));

//Reviews
//Delete Route
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewsController.destroyReview));


module.exports = router;