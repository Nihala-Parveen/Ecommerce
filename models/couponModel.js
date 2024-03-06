const mongoose = require('mongoose')

const couponSchema = mongoose.Schema ( {
    couponCode : {
        type : String ,
        unique : true , 
        required : true
    } ,
    description : {
        type : String ,
        required : true
    } ,
    discountAmount : {
        type : Number ,
        required : true
    } ,
    minAmount : {
        type : Number ,
        required : true
    } ,
    status : {
        type : String ,
        required : true ,
        default : "Active"
    } ,
    expiryDate : {
        type : Date ,
        required : true
    }
})

module.exports = mongoose.model ('Coupon' , couponSchema )