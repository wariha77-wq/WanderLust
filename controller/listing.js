const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res)=>{
   const allListings =  await Listing.find({});
   res.render("./listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res)=>{
     res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({
      path:"reviews",
      populate:{
        path:"author",
      },
    }).populate("owner");
    if(!listing){
      req.flash("error","Requested listing does not exist!");
      return res.redirect("/listings");
    }else{
      res.render("./listings/show.ejs",{listing});
    }

};

module.exports.createListing = async (req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({ 
      query: req.body.listing.location,
      limit: 1 
    }).send() 
    console.log();
    let url = req.file.path;
    let filename = req.file.filename;
    let listingData = req.body.listing;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {filename,url};
    newListing.geometry = response.body.features[0].geometry;
    let cord = await newListing.save();
    console.log(cord);
    req.flash("success","New listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Requested listing does not exist!");
      res.redirect("/listings");
    }else{
      let orgUrl = listing.image.url;
      orgUrl = orgUrl.replace("/upload","/upload/w_250");
      res.render("./listings/edit.ejs",{listing,orgUrl});
    }
};

module.exports.updateListing = async (req,res)=>{
  let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
  
  if(typeof req.file !== "undefined"){ //check if req mai file exist krti hy?
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {filename,url};
    await listing.save();
  }
  
  req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}