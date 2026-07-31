const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const {isLoggedIn,isOwner} = require("../middleware.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
// const upload = multer({dest:'uploads/'}); //this could be a folder where the images will be saved 
const upload = multer({storage});  //uploading on cloudinary

const listingController = require("../controller/listing.js");

const validateListing = (req,res,next) => {
   let {error} = listingSchema.validate(req.body);
   if(error){
     let errMsg = error.details.map((el) => el.message).join(",");
     throw new ExpressError(400,errMsg);
   }else{
     next();
   }
}

router  // This is router.route
  .route("/")
  .get(wrapAsync(listingController.index)) //index route
  .post(isLoggedIn,validateListing,upload.single("image"),wrapAsync(listingController.createListing)); //Create route
  


router.get("/new",isLoggedIn,listingController.renderNewForm); //new route


router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) //show route
  .put(isLoggedIn,isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)) //update route
  .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing));

module.exports = router;