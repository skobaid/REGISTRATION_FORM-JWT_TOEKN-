const momgoose = require("mongoose"); 
const bcrypt = require("bcryptjs");     //For Password Hashing
const jwt = require("jsonwebtoken");    //For Tokens


const employSchema = new momgoose.Schema({
    firstname :
    {
        type :String,
        require:true
    },
    lastname :
    {
        type :String,
        require:true
    },
    email :
    {
        type :String,
        require:true,
        unique : true,
    },
    gender :
    {
        type:String,
        require :true
    },
    phone :
    {
        type :Number,
        require :true,
        unique:true,
    },
    password :
    {
        type:String,
        require:true
    },
    confirmpassword:
    {
        type :String,
        require:true
    },
    tokens:             //for token(array of object)
    [{
        token:
        {
            type:String,
            required:true,
        }
    }]
})

//=============================Generating Tokens==================================================
employSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        //console.log(token + "=========");
        return token;
    }catch(error){res.send("The Error Part" + error);
            console.log("The Error Part" + error);
        }
}
//========================For Password Hashing==================================//
employSchema.pre("save",async function(next){
    //const passwordHash = await bcrypt.hash(password,10);       //For Password Hashing
    if(this.isModified("password"))
    {
    //console.log(`Password Before Hashing = ${this.password}`);
    this.password = await bcrypt.hash(this.password,10);
    //console.log(`Password After Hashin = ${this.password}`);
    this.confirmpassword = await bcrypt.hash(this.password,10); 
    //this.confirmpassword = undefined;                       //It will remove confirmpassword field frm database
    }
    next();
})


//now we need to create collection(table)=========

const Register = new momgoose.model("Register",employSchema);

module.exports = Register;      //Here We Export Register Collection(table)