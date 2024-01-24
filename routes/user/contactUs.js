const express = require ('express')
const user_Route = express()

user_Route.set ('view engine','ejs')
user_Route.set ('views','./views/users')

const contactController = require ( "../../controllers/user/contactUsController" )

user_Route.get ( "/contactUs" , contactController.loadContactUs )

module.exports = user_Route