const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

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

app.get("/",(req,res)=>{
    res.send("Hi!");
})

const validateListing = (req,res,next) => {
   let {error} = listingSchema.validate(req.body);
   if(error){
     let errMsg = error.details.map((el) => el.message).join(",");
     throw new ExpressError(400,errMsg);
   }else{
     next();
   }
}

//index route
app.get("/listings",wrapAsync(async (req,res)=>{
   const allListings =  await Listing.find({});
   res.render("./listings/index.ejs",{allListings});
}))

//new form
app.get("/listings/new",(req,res)=>{
    res.render("./listings/new.ejs");
})

//show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs",{listing});
}))

//create route
app.post("/listings",validateListing,
    wrapAsync(async (req,res,next)=>{
    // let {title,description,img,price,location,country} = req.body;
    //other wayyyyy------
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
 })
);
//edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",
  validateListing,
  wrapAsync(async (req,res)=>{
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}))

// app.get("/testlisting",async (req,res)=>{
//    let sample = new Listing({
//     title:"My New Villa",
//     description:"By the beach",
//     price: 1200,
//     location: "Manora, Karachi",
//     country: "Pakistan" 
//    });

//    await sample.save();
//    console.log("Sample was saved");
//    res.send("Success");
// })

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