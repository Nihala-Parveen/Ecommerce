const express = require ('express')
const user_Route = express()

user_Route.set ('views','./views/users')

const accountController = require ( "../../controllers/user/accountController" )
const auth = require('../../middleware/userAuth')

user_Route.get ("/profile" , auth.isLogin , accountController.loadProfile)
user_Route.get("/editprofile" , accountController.editprofileLoad )
user_Route.post("/editprofile" , accountController.updateProfile )
user_Route.get('/change-password' , accountController.changePasswordLoad )
user_Route.post("/change-password" , accountController.changePassword)
user_Route.get("/addresses" , accountController.getAddresses )
user_Route.get("/addAddress" , accountController.addAddressLoad )
user_Route.post('/addAddress' , accountController.addAddress )

module.exports = user_Route