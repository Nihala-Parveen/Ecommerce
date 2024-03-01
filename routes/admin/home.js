const express = require ('express')
const admin_Route = express()

admin_Route.set ('views','./views/admin')

const homeController = require ( "../../controllers/admin/adminhomeController" )
const auth = require('../../middleware/adminAuth')

admin_Route.get ( "/admin" , auth.isLogin , homeController.loadHome)
admin_Route.get('/topProducts' , homeController.calculateTopSellingProducts )
admin_Route.get('/topCategory' , homeController.calculateTopSellingCategory )
admin_Route.post ("/salesReport" ,homeController.getSalesReport)
admin_Route.post("/dateSales" , homeController.getCustomDateSales )
admin_Route.post('/downloadPdf' , homeController.downloadSalesReport )
admin_Route.post('/downloadExcel' , homeController.downloadExcelReport )

module.exports = admin_Route