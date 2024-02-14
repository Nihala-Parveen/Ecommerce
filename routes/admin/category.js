const express = require ('express')
const category_Route = express()

category_Route.set ('views','./views/admin')

const categoryController = require ( "../../controllers/admin/categoryController" )
const fileupload = require ("../../middleware/uploadFile")
const auth = require('../../middleware/adminAuth')

category_Route.get ( "/addcategory" , auth.isLogin ,categoryController.loadAddCategory)
category_Route.post ( "/addcategory" , fileupload.single('catImg') , categoryController.addCategory )
category_Route.get ("/viewcategory" , auth.isLogin , categoryController.viewCategory )
category_Route.get ("/editcategory" , auth.isLogin , categoryController.editcategoryLoad )
category_Route.post ("/editcategory" , fileupload.single('catImg') , categoryController.updateCategory)
category_Route.get ("/deletecategory" , categoryController.deleteCategory )

module.exports = category_Route