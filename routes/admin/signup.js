const express = require ('express')
const admin_Route = express()
const bodyParser = require ('body-parser')

admin_Route.set ('view engine','ejs')
admin_Route.set ('views','./views/admin')

admin_Route.use ( bodyParser.json() )
admin_Route.use ( bodyParser.urlencoded ( {extended : true}))

const signupController = require ( "../../controllers/admin/adminsignupController" )

admin_Route.get ( "/adminsignup" , signupController.loadRegister)
admin_Route.post ( "/adminsignup" , signupController.validateSignup , signupController.insertAdmin )

module.exports = admin_Route