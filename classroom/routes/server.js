const express = require("express");
const app = express();
const session = require("express-session");
const port = 3000;

const sessionOpts = {
    secret:"supersecret", 
    resave:false,
    saveUninitialized:true
};

app.use(session(sessionOpts)); //sends a session id as cookie

// app.get("/reqcount",(req,res)=>{
//     if(req.session.count){  //req.session tracks a single session
//         req.session.count++;
//     }else{
//         req.session.count=1;
//     }
//     res.send(`Req sent ${req.session.count} times`);
// })

// app.get("/test",(req,res)=>{
//     res.send("Hi,Success");
// })

app.listen(port,()=>{
    console.log(`Server running at port ${port}`);
})
