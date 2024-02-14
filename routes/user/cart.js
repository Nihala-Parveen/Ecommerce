const express = require('express')
const cartRoute = express()

cartRoute.set ('views','./views/users')

const cartController = require('../../controllers/user/cartController')
const auth = require('../../middleware/userAuth')

cartRoute.post('/addtocart' , auth.isLogin , cartController.addtoCart )
cartRoute.post('/editquantity' , cartController.updateQuantity )
cartRoute.get('/cart' , auth.isLogin , cartController.viewcart )
cartRoute.get('/removecart' , cartController.removecart )

cartRoute.get('/checkout' , cartController.loadCheckout )

module.exports = cartRoute