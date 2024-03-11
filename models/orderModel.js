const mongoose = require('mongoose')

const orderSchema = mongoose.Schema ( {
    user : {
        type : mongoose.Types.ObjectId ,
        ref : 'User'
    } ,
    products : [ {
        productId : {
            type : mongoose.Types.ObjectId ,
            ref : 'Product'
        } ,
        quantity : {
            type : Number ,
            required : true
        } , 
        price : {
            type : Number ,
            required : true
        } , 
        status : {
            type : String , 
            default : 'Pending'
        } ,
        paymentStatus : {
            type : String , 
            default : 'Pending'
        }
    }] ,
    amount : {
        type : Number ,
        required : true
    } ,
    address : {
        buildingName : { type : String } ,
        city : { type : String } , 
        district : { type : String } ,
        ZIPcode : { type : String }
    } ,
    date : {
        type : Date ,
        required : true
    } ,
    coupon : {
        couponCode : {
            type : String ,
            default : ""
        } ,
        couponDiscount : { 
            type : Number ,
            default : 0
        }
    } ,
    payment : {
        type: String 
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    status: {
        type: String,
        default: 'Pending',
        required: true
    } 
},
    {
        timestamps: true,
    })

module.exports = mongoose.model ('Order' , orderSchema )