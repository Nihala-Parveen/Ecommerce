const express = require('express')
const cartRoute = express()
const bodyParser = require('body-parser')

cartRoute.set ('view engine','ejs')
cartRoute.set ('views','./views/users')

cartRoute.use (bodyParser.json())
cartRoute.use (bodyParser.urlencoded({extended:true}))

const cartController = require('../../controllers/user/cartController')
const auth = require('../../middleware/userAuth')

cartRoute.post('/addtocart' , auth.isLogin , cartController.addtoCart )
cartRoute.post('/editquantity' , cartController.updateQuantity )
cartRoute.get('/cart' , auth.isLogin , cartController.viewcart )
cartRoute.get('/removecart' , cartController.removecart )

cartRoute.get('/checkout' , cartController.loadCheckout )

module.exports = cartRoute