const express = require ('express')
const user_Route = express()

user_Route.set ('view engine','ejs')
user_Route.set ('views','./views/users')

const homeController = require ( "../../controllers/user/homeController" )

user_Route.get ("/" , homeController.loadHome)
user_Route.get ("/home" , homeController.loginHome )

module.exports = user_Route