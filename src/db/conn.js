const mongoose =  require("mongoose");

mongoose.connect("mongodb://localhost:27017/RegistrationForm").then(()=>{
    console.log("Connection is Successful.....")
}).catch((e)=>{
    console.log("connection Failed............")
})