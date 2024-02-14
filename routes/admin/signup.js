const express = require ('express')
const admin_Route = express()

admin_Route.set ('views','./views/admin')

const signupController = require ( "../../controllers/admin/adminsignupController" )

admin_Route.get ( "/adminsignup" , signupController.loadRegister)
admin_Route.post ( "/adminsignup" , signupController.validateSignup , signupController.insertAdmin )

module.exports = admin_Route