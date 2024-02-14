const express = require ('express')
const admin_Route = express()
const session = require("express-session")

admin_Route.use ( session ( {
    secret : "admin" ,
    resave : false , 
    saveUninitialized : true
}))

admin_Route.set ('views','./views/admin')

const loginController = require ( "../../controllers/admin/adminloginController" )

admin_Route.get ( "/adminlogin" , loginController.loginLoad )
admin_Route.post ("/adminlogin" , loginController.verifyLogin )

admin_Route.get ("/adminlogout" , loginController.logOut )

module.exports = admin_Route