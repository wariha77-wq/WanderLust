module.exports.isLoggedIn = (req,res,next)=>{
   if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash("error","Please login to create Listing!");
    res.redirect("/login");
   }else{
      next();
   }
}

module.exports.saveRedirectUrl = (req,res,next)=>{
   if(req.session.redirectUrl){
      res.locals.redirectUrl = req.session.redirectUrl;
   }
   next();
}