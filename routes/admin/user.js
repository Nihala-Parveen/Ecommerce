const express = require ('express')
const userRoute = express()
const bodyParser = require('body-parser')

userRoute.set('view engine' , 'ejs')
userRoute.set('views' , './views/admin')

userRoute.use(bodyParser.json())
userRoute.use(express.urlencoded({extended:true}))

const userController = require ('../../controllers/admin/userController')
const auth = require('../../middleware/adminAuth')

userRoute.get ('/viewusers' , auth.isLogin , userController.viewUsers )
userRoute.post('/toggleuserblock' , userController.toggleblockUser )

module.exports = userRoute