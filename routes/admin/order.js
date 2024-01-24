const express = require ('express')
const order_Route = express()
const bodyParser = require ('body-parser')

order_Route.set ('view engine','ejs')
order_Route.set ('views','./views/admin')

order_Route.use ( bodyParser.json() )
order_Route.use ( bodyParser.urlencoded ( {extended : true}))

const orderController = require ( "../../controllers/admin/orderController" )
const auth = require('../../middleware/adminAuth')

order_Route.get('/view-orders' , auth.isLogin , orderController.viewOrder )
order_Route.get('/order-details' , orderController.orderDetails )
order_Route.get('/changestatus' , orderController.changeStatusLoad )
order_Route.post('/changestatus' , orderController.changeStatus )

module.exports = order_Route
