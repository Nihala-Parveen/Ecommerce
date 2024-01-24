const express = require ('express')
const user_Route = express()
const bodyParser = require('body-parser')
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

user_Route.use ( bodyParser.json() )
user_Route.use ( bodyParser.urlencoded ({extended : true }))

user_Route.set ('view engine','ejs')
user_Route.set ('views','./views/users')

const loginController = require ( "../../controllers/user/loginController" )

user_Route.get ( "/login" , loginController.loginLoad)
user_Route.post ("/login" , loginController.verifyLogin)

user_Route.get('/logout', loginController.logOut )


module.exports = user_Route