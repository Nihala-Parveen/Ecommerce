const express = require ('express')
const user_Route = express()
const session = require('express-session')

user_Route.use ( session ( {
    secret : process.env.SESSION_SECRET , 
    resave : false , 
    saveUninitialized : true
}))

user_Route.use ( ( req , res , next ) => {
    res.header('Cache-Control','no-store,no-cache,must-revalidate,max-age=0')
    next()
})

user_Route.set ('views','./views/users')

const loginController = require ( "../../controllers/user/loginController" )

user_Route.get ( "/login" , loginController.loginLoad)
user_Route.post ("/login" , loginController.verifyLogin)

user_Route.get('/logout', loginController.logOut )

user_Route.get('/forgetPassword' , loginController.getForgetPassword )
user_Route.post('/forgetPassword' , loginController.forgetVerify )

user_Route.get('/resetPassword' , loginController.getResetPassword )
user_Route.post('/resetPassword' , loginController.resetPassword )

module.exports = user_Route