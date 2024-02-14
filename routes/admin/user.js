const express = require ('express')
const userRoute = express()

userRoute.set('views' , './views/admin')

const userController = require ('../../controllers/admin/userController')
const auth = require('../../middleware/adminAuth')

userRoute.get ('/viewusers' , auth.isLogin , userController.viewUsers )
userRoute.post('/toggleuserblock' , userController.toggleblockUser )

module.exports = userRoute