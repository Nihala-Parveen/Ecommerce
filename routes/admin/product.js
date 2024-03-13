const express = require ('express')
const product_Route = express()

product_Route.set ('views','./views/admin')

const productController = require ( "../../controllers/admin/productController" )
const fileupload = require ("../../middleware/uploadFile")
const auth = require('../../middleware/adminAuth')

product_Route.get ("/addproduct" , auth.isLogin , productController.loadaddProduct )
product_Route.post ("/addproduct" , fileupload.array('files' , 5) , productController.addProduct)
product_Route.get ("/viewproducts" , auth.isLogin , productController.viewProduct )
product_Route.get ("/viewsingleproduct" , productController.viewsingleProduct )

product_Route.get("/editproduct" , auth.isLogin , productController.editproductLoad )
product_Route.post("/editproduct" , fileupload.array('files',5) , productController.updateProduct )

product_Route.get('/deleteImg' , productController.deleteImg )
product_Route.post('/replaceImg', fileupload.single('upd') , productController.replaceImg);

product_Route.get ("/deleteProduct" , productController.softdeleteProduct )

module.exports = product_Route