const express = require("express");
const router = express.Router({mergeParams: true}); //to use :id from route
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const {isLoggedIn,isAuthor} = require("../middleware.js");

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
router.post("/",isLoggedIn,validateReview,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review (req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New Review Added!");
    res.redirect(`/listings/${listing._id}`);
}));

//Reviews
//Delete Route
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(async (req,res)=>{
  let {id,reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review Deleted!");
  res.redirect(`/listings/${id}`);
}));


module.exports = router;