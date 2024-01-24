const express = require ('express')
const admin_Route = express()
const bodyParser = require ('body-parser')
const session = require("express-session")

admin_Route.use ( session ( {
    secret : "admin" ,
    resave : false , 
    saveUninitialized : true
}))

admin_Route.set ('view engine','ejs')
admin_Route.set ('views','./views/admin')

admin_Route.use ( bodyParser.json() )
admin_Route.use ( bodyParser.urlencoded ( {extended : true}))

const loginController = require ( "../../controllers/admin/adminloginController" )

admin_Route.get ( "/adminlogin" , loginController.loginLoad )
admin_Route.post ("/adminlogin" , loginController.verifyLogin )

admin_Route.get ("/adminlogout" , loginController.logOut )

module.exports = admin_Route