const User = require('../../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const randomString = require('randomstring')
const securePassword = require('./signupController')

const loginLoad = async (req , res) => {
    try {
        res.render ('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res) => {
    try {
        const { email , password } = req.body
        const userData = await User.findOne({email:email})
        if(userData){
            if(userData.isBlocked){
                return res.render('login' , { message : "Your account has been blocked by admin"})
            }
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch) {
                req.session.user_id = userData._id
                res.redirect('/home')
            }
            else {
                res.render('login',{message:"Email or password incorrect"})
            }
        }
        else{
            res.render('login',{message:"Email or password incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logOut = async (req,res) => {
    try {
        req.session.destroy()
        res.redirect ('/')
    } catch (error) {
        console.log (error.message)
    }
}

//forget password

const sendResetVerify = async ( name , email , token ) => {
    try {
        const transporter = nodemailer.createTransport ( {
            host : 'smtp.gmail.com' ,
            port: 587,
            secure: false ,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        })
        const mailOptions = {
            from: process.env.SMTP_USER , // sender address
            to: email ,
            subject: "For Reset Password", // Subject line
            html: '<p>Hii ' +name+ ', please click here to <a href="http://127.0.0.1:3000/resetPassword?token=' +token+'"> Reset </a> your password. </p>' // html body
        }
        console.log("Email link:", 'http://127.0.0.1:3000/resetPassword?token=' + token);
        transporter.sendMail(mailOptions)
    } catch (error) {
        console.log(error.message);
    }
}

const getForgetPassword = async ( req , res ) => {
    try {
        res.render('forgetPassword')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async ( req , res ) => {
    try {
        const { email } = req.body
        const userData = await User.findOne ( { email : email } )
        if ( userData ) {
            const randomstring = randomString.generate()
            await User.updateOne( { email : email } , { $set : { token : randomstring } } )
            sendResetVerify( userData.name ,userData.email , randomstring )
            res.render('forgetPassword' , { message : 'Please check your mail to reset your password.'})
        } else { 
            res.render('forgetPassword' , { message : 'Email is incorrect'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getResetPassword = async ( req , res ) => {
    try {
        const { token } = req.query
        const tokenData = await User.findOne( { token : token } )
        if ( tokenData ){
            res.render('resetPassword' , { user_id : tokenData._id })
        } 
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async ( req , res ) => {
    try {
        const { password ,cpassword ,  user_id } = req.body
        if(password === "" || cpassword === ""){
            return res.render('resetPassword' , { message : "Please fill out all the fields" , user_id })
        }
        if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)){
            return res.render('resetPassword' , { message : 'Password must be greater than 5 and contain atleast one uppercase letter, one number' , user_id })
        }
        if ( password !== cpassword ) {
            return res.render('resetPassword' , { message : "Passwords don't match" , user_id } )
        }
        const securePasssword = await securePassword.securePassword(password)
        await User.findByIdAndUpdate({ _id : user_id } , { $set : { password : securePasssword , token : ''}})
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loginLoad , 
    verifyLogin ,
    logOut ,
    getForgetPassword ,
    forgetVerify ,
    getResetPassword ,
    resetPassword
}