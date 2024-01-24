const express = require ('express')
const user_Route = express()

user_Route.set ('view engine','ejs')
user_Route.set ('views','./views/users')

const aboutController = require ( "../../controllers/user/aboutController" )

user_Route.get ( "/about" , aboutController.loadAbout)

module.exports = user_Route