const express = require ('express')
const orderRoute = express()
const bodyParser = require ('body-parser')

orderRoute.set ('view engine','ejs')
orderRoute.set ('views','./views/users')

orderRoute.use ( bodyParser.json() )
orderRoute.use ( bodyParser.urlencoded ( { extended : true }))

const ordercontroller = require('../../controllers/user/orderController')

orderRoute.post('/confirmorder' , ordercontroller.postOrder )
orderRoute.get('/orders' , ordercontroller.getOrders )
orderRoute.get('/vieworder' , ordercontroller.viewOrder )
orderRoute.post('/cancelOrder' , ordercontroller.cancelOrder )

module.exports = orderRoute