require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db')

const bodyparser = require('body-parser');
app.use(bodyparser.json());

const PORT=process.env.PORT||3000;


//import the routerfiles


const userRoutes=require('./routes/userRoutes');
const candidateRoutes=require('./routes/candidateRoutes ');
//use the routers
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);


app.listen(PORT, () => {
    console.log("server is running")
})