const express = require ('express')
const user_Route = express()
const session = require('express-session')

user_Route.use(session ( {
    secret : 'verification' ,
    resave : false ,
    saveUninitialized : false
}))

user_Route.set ('views','./views/users')

const signupController = require ('../../controllers/user/signupController')
const otpController = require ( "../../controllers/user/otpController" )

user_Route.get ( "/otp" , otpController.loadOtp )
user_Route.post( "/send" ,  signupController.validateSignup , signupController.insertUser )
user_Route.post ("/verify" , otpController.verify )

module.exports = user_Route