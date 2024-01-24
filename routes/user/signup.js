const express = require ('express')
const user_Route = express()
const bodyParser = require ('body-parser')
const session = require('express-session')

user_Route.use(session ( {
    secret : 'signup',
    resave : false ,
    saveUninitialized : false
}))

user_Route.set ('view engine','ejs')
user_Route.set ('views','./views/users')

user_Route.use ( bodyParser.urlencoded ( {extended : true}))

const signupController = require ( "../../controllers/user/signupController" )

user_Route.get ( "/signup" , signupController.loadRegister)

module.exports = user_Route