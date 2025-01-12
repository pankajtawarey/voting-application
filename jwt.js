const jwt=require('jsonwebtoken');

const jwtauthmiddleware=(req,res,next)=>{

    //first check request header has authorization or not
    const authorization=req.headers.authorization;
    if(!authorization) return res.status(401).json({error:'token not found'})

    //exact the jwt token from ther request
   const  token=req.headers.authorization.split(' ')[1];
   if(!token) return res.status(401).json({error:'unauthorized'});
   
   try{
    // verify the jwt token
    const decoded=jwt.verify(token,process.env.JWT_SECRET);

    //attach user information to the request object
    req.user=decoded
    next();

   }catch(err){
    console.error(err);
    res.status(401).json({error:'invalid token'});

   }

}

//function to generate jwt token
const generatetoken=(userData)=>{
    //generate a new jwt token using user data
    return jwt.sign(userData,process.env.JWT_SECRET);
}
module.exports={jwtauthmiddleware,generatetoken};