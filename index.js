const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Importing Custom Modules-
const userModel = require('./models/usermodel');
const foodModel = require('./models/foodModel');
const trackModel = require('./models/trackModel');
require('dotenv').config();
// Creating A Server
const app = express();

// To get the data from client or user
app.use(express.json());

// Register Endpoint
app.post("/register", (req, res) => {
    let body = req.body;
    bcrypt.hash(body.password, 10, async(err, hpass) => {
        if (!err) {
            body.password = hpass;
            try {
                let doc = await userModel.create(body)
                res.status(201).send({message:"User Created"})
            }  
            catch (err) {
                res.status(500).send("Problem While connecting")
            }
        }
    })

})

// Login Endpoint
app.post("/login",async(req,res)=>{
  let userCred =  req.body;
  try{
   let data =  await userModel.findOne({email:userCred.email})
   if(data!==null){
   bcrypt.compare(userCred.password,data.password,(err,success)=>{
    if(success){
        jwt.sign({email:userCred.email},"Koushik@99",(err,token)=>{
            if(token){
                res.status(200).send({message:"Login Succesfull",Token:token})
            }
            else{
                res.status(500).send({message:"Token Generation Failed"})
            }
        })
    }
    else{
        res.status(500).send({message:"Incorrect Password"})
    }
   })
   }
   else{
    res.send("User Not Found")
   }
  }
  catch(err){
    res.status(500).send("Server Failure")
    console.log(err)
  }
})

// Middleware
function middleware(req,res,next){
  let token  = req.headers.authorization.split(" ")[1];
  if(token!==null){
    jwt.verify(token,"Koushik@99",(err,sucess)=>{
        if(sucess){
            console.log("Token is Verified");
            next();
        }
        else{
            console.log("Incorrect Token")
        }
    })
  }
}

//get foods endponints
app.get("/getfoods",middleware,async(req,res)=>{
   try{
    let data = await foodModel.find();
    res.status(200).send(data);
   }
   catch(err){
        res.status(500).send("Server Failed");
        console.log(err)
    }
})

// add Food Items
app.post("/addfoods",middleware,async(req, res)=>{
    let body = req.body;
    try{
        let doc =  await foodModel.create(body);
        res.status(201).send({message:"Food Item Added"})
    }
    catch(err){
        res.status(500).send("Server Failed");
        console.log(err)
    }
})


// Getting  food items By Its name
app.get('/getfoods/:name',middleware,async(req,res)=>{
    let userfood= req.params.name;
   try{
    let data = await foodModel.find({name:{$regex:userfood,$options:'i'}});
    res.send(data)
   }
    catch(err){
        console.log(err)
    }
})

//Adding Eaten food 
app.post('/addfoodtrack',middleware,async(req,res)=>{
   let userFood = req.body;
   try{
    let data = await trackModel.create(userFood);
    res.status(201).send({message:'Food added into Record'})
   }
   catch(err){
        res.status(500).send({message:"Server Error"})
        console.log(err)
   }
})


// Food Eaten By User Till Date
app.get("/gettrackfood/:id",middleware,async(req,res)=>{
    let id = req.params.id;
   try{
    let data = await trackModel.findOne({userId:id}).populate('userId')
    res.status(200).send(data)
   }
      catch(err){
        res.status(500).send({message:"Server Error"})
        console.log(err)
   }

})


// Food Eaten By User On Specific Date

app.get("/gettrackfoods/:id/:date",middleware,(req,res)=>{
    res.send("Geeting dataof a Specific Date")
})

//Connecting To Database
mongoose.connect(process.env.mongo_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Assigning a Port Number
app.listen(process.env.port || 8000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.port}`);
})


