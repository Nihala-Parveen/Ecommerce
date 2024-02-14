const express = require ('express')
const productRoute = express()

productRoute.set ('views','./views/users')

const productController = require ('../../controllers/user/productController')
const auth = require('../../middleware/userAuth')

productRoute.get('/productlist' , productController.productLoad )
productRoute.get('/category' , productController.categoryLoad )
productRoute.get('/product' , productController.productbycategoryLoad )
productRoute.get('/productdetails' , productController.productDetails )

module.exports = productRoute