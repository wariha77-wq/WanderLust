const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
    console.log("connected successfully");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(mongo_url);
}

const initDB = async ()=>{
 await Listing.deleteMany({});
 initData.data = initData.data.map((obj)=>({...obj,owner:"6a68eac23b0909852695b20e"}))
 await Listing.insertMany(initData.data);
 console.log("data was initialized");
}

initDB();