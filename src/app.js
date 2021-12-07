require('dotenv').config();                 //This is For env   dotenv
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
require("../src/db/conn");
const bcrypt = require("bcryptjs");
const Register = require("./models/register");
const cookieParser = require("cookie-parser");
const auth  = require("./middleware/auth");     //This is for auth
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const staticPath = path.join(__dirname,"../public");                    //This is For Html File
const templatesPath = path.join(__dirname,"../templates/views");        // For Templates Path
const partialPath = path.join(__dirname,"../templates/partials");       //For Partials Path

app.use(express.json());
app.use(express.urlencoded({extended:false})); //For Getting Data From Form
app.use(cookieParser());                       //For CookieParse

app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views",templatesPath)
hbs.registerPartials(partialPath);

console.log(process.env.SECRET_KEY);    //SECRET_KEY

app.get("/",(req,res)=>{
    res.render("index.hbs")
})
app.get("/secret",auth,(req,res)=>{
    // console.log(`This is the cookie = ${req.cookies.jwt}`);     //Getting token from cookie
    res.render("secret.hbs")
})
app.get("/logout",auth,async(req,res)=>{
    try{
        //For single Device Logout
        // req.user.tokens = req.user.tokens.filter((currentElement)=>{
        //     return currentElement.token !== req.token;              //req.token=Current Token
        // })

        //For All device Logout
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("Logout Successfully");
        await req.user.save();
        res.render("login");
    }catch(error){
        res.status(401).send(error);
    }
})
app.get("/register",(req,res)=>{
    res.render("register.hbs")
})
app.get("/login",(req,res)=>{
    
    res.render("login.hbs")
})

//=======================================================================================================//

//Create A New User in Our Database (For Register)
app.post("/register",async(req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password===cpassword)
        {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname : req.body.lastname,
                email    : req.body.email,
                gender   : req.body.gender,
                phone    : req.body.phone,
                password :req.body.password,
                confirmpassword:req.body.password
            })

            // middleware)
            console.log("The Success Part" + registerEmployee);
            const token  = await registerEmployee.generateAuthToken();  //here we calling the function of generate token from regsiter.js
            console.log("the Token Part = " + token)

           //Adding Tokens Into Cookies
           //The res.cookie finction is used to set the cookie name to value.
           //The Value Parameter may be a string or object converted to JSON.
           // Syntax res.cookie(name,value,[Options])

           res.cookie("jwt",token,{
               expires : new Date(Date.now() + 30000),
               httpOnly:true,
               //secure  :true
           });
            
            //console.log(registerEmployee);
            const registered = await registerEmployee.save();
            res.status(201).render("login");
        }
        else
        {
            res.send("Password Are Not Matching");
        }
        // console.log(req.body.firstname);
        // res.send(req.body.firstname);
    }catch(e){res.status(400).send(e)}
})

//Login Check
app.post("/login",async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        //console.log(`${email} and Pass Is ${password}`);

        //Matching email ans Pass From Regiser
        const userEmail = await Register.findOne({email:email});
       //res.send(userEmail.password);
       
       const isMatch = await bcrypt.compare(password, userEmail.password);  //Matching email ans Pass From Regiser
       
       //===== Token
       const token  = await userEmail.generateAuthToken();  //here we calling the function of generate token from regsiter.js
       console.log("the Token Part of login = " + token)   //Middleware (Token)
       
       //Adding Tokens into Cookies
       res.cookie("jwt",token,{
            expires : new Date(Date.now() + 60000),
            httpOnly:true,
            //secure  :true
        });
       
       if(isMatch)
       {   
            res.status(201).render("index");
       }
       else
       {
           res.send("Email And Password Are Not Matching")
       }
    }catch(e){res.status(400).send("Invalid Details")}
})


//============================ Secure Password Using Bcrypt in NodeJS ==========================//
// const bcrytpt = require("bcryptjs");
// const { secureHeapUsed } = require("crypto");

// const SecurePassword = async (password)=>{
//     console.log(password);
//     const HashPass = await bcrytpt.hash(password,10);
//     console.log(HashPass);
// }
// SecurePassword("Obaid@123");


//=============================JWT Tokens=======================================//
// const jwt = require("jsonwebtoken");

// const createToken = async ()=>{
//    const token = await jwt.sign({_id:"6195f0f18278815b9140c68a"},"mynameisobaiduurahmanaabdulrazzaqueshaikhiamworkingatmalegaonwebtechnology",
//    {
//        expiresIn:"15 seconds"
//    });
//    console.log("token = " + token);

//    //for verify
//    const userverification = await jwt.verify(token,"mynameisobaiduurahmanaabdulrazzaqueshaikhiamworkingatmalegaonwebtechnology");
//    console.log(userverification);
// }
// createToken();
//===========================================================================================//

app.listen(port,()=>{
    console.log(`Server Is Running At Port No ${port}`);
})