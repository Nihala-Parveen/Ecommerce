const express = require ('express')
const productRoute = express()
const bodyParser = require ('body-parser')

productRoute.set ('view engine','ejs')
productRoute.set ('views','./views/users')

productRoute.use ( bodyParser.json() )
productRoute.use ( bodyParser.urlencoded ( { extended : true }))

const productController = require ('../../controllers/user/productController')
const auth = require('../../middleware/userAuth')

productRoute.get('/productlist' , productController.productLoad )
productRoute.get('/category' , productController.categoryLoad )
productRoute.get('/product' , productController.productbycategoryLoad )
productRoute.get('/productdetails' , productController.productDetails )

module.exports = productRoute