const express = require ('express')
const user_Route = express()
const bodyParser = require('body-parser')

user_Route.use (bodyParser.json())
user_Route.use (bodyParser.urlencoded ({ extended : true }))

user_Route.set ('view engine','ejs')
user_Route.set ('views','./views/users')

const accountController = require ( "../../controllers/user/accountController" )

user_Route.get ("/profile" , accountController.loadProfile)
user_Route.get("/editprofile" , accountController.editprofileLoad )
user_Route.post("/editprofile" , accountController.updateProfile )
user_Route.get('/change-password' , accountController.changePasswordLoad )
user_Route.post("/change-password" , accountController.changePassword)
user_Route.get("/addresses" , accountController.getAddresses )
user_Route.get("/addAddress" , accountController.addAddressLoad )
user_Route.post('/addAddress' , accountController.addAddress )

module.exports = user_Route