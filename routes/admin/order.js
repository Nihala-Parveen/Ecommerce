const express = require ('express')
const order_Route = express()

order_Route.set ('views','./views/admin')

const orderController = require ( "../../controllers/admin/orderController" )
const auth = require('../../middleware/adminAuth')

order_Route.get('/view-orders' , auth.isLogin , orderController.viewOrder )
order_Route.get('/order-details' , orderController.orderDetails )
order_Route.get('/changestatus' , orderController.changeStatusLoad )
order_Route.post('/changestatus' , orderController.changeStatus )

module.exports = order_Route
