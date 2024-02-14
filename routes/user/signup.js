const express = require ('express')
const user_Route = express()
const session = require('express-session')

user_Route.use(session ( {
    secret : 'signup',
    resave : false ,
    saveUninitialized : false
}))

user_Route.set ('views','./views/users')

const signupController = require ( "../../controllers/user/signupController" )

user_Route.get ( "/signup" , signupController.loadRegister)

module.exports = user_Route