const express = require ('express')
const orderRoute = express()

orderRoute.set ('views','./views/users')

const ordercontroller = require('../../controllers/user/orderController')
const auth = require('../../middleware/userAuth')

orderRoute.post('/applyCoupon' , ordercontroller.applyCoupon )
orderRoute.get('/viewCoupons' , ordercontroller.viewCoupons )
orderRoute.post('/confirmorder' , ordercontroller.postOrder )
orderRoute.get('/orderSuccess' , ordercontroller.orderSuccess )
orderRoute.post('/continuePayment' , ordercontroller.continuePayment )
orderRoute.post('/verifyPayment' , ordercontroller.verifyPayment )
orderRoute.get('/orders' , auth.isLogin , ordercontroller.getOrders )
orderRoute.get('/vieworder' , ordercontroller.viewOrder )
orderRoute.post('/cancelOrder' , ordercontroller.cancelOrder )
orderRoute.post('/returnOrder' , ordercontroller.returnOrder )
orderRoute.post('/cancelProduct' , ordercontroller.cancelOrderItem )
orderRoute.get('/invoice' , ordercontroller.downloadInvoice )

module.exports = orderRoute