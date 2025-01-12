require('dotenv').config();
const mongoose=require('mongoose');



// const url='mongodb://localhost:27017/Hotal';
// const url='mongodb+srv://codewebsite143:pankaj123@cluster0.yjdsc.mongodb.net/';
// const url=process.env.MONGODB_URL;
const url=process.env.LOCAL_HOST;
mongoose.connect(url);

const db=mongoose.connection

db.on('connected',()=>{
    console.log("connected")
})
db.on('error',(err)=>{
    console.log("conection error",err)
})
db.on('disconnected',()=>{
    console.log("disconected")
})

module.exports=db;

