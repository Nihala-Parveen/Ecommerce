const express = require ('express')
const admin_Route = express()

admin_Route.set ('view engine','ejs')
admin_Route.set ('views','./views/admin')

const homeController = require ( "../../controllers/admin/adminhomeController" )
const auth = require('../../middleware/adminAuth')

admin_Route.get ( "/admin" , auth.isLogin , homeController.loadHome)

module.exports = admin_Route