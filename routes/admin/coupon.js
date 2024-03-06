const express = require ('express')
const couponRoute = express()

couponRoute.set ('views','./views/admin')

const couponController = require ('../../controllers/admin/couponController')

couponRoute.get ('/addCoupon' ,couponController.getAddCoupon )
couponRoute.post ('/addCoupon' , couponController.addCoupon )
couponRoute.get ('/coupons' , couponController.viewCoupon )
couponRoute.get ('/editCoupon' , couponController.getEditCoupon )
couponRoute.post ('/editCoupon' , couponController.updateCoupon )
couponRoute.get ('/deleteCoupon' , couponController.deleteCoupon )

module.exports = couponRoute