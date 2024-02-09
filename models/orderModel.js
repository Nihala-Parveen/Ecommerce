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
    payment : {
        type : String 
    } ,
    paymentStatus : {
        type: String,
        default: 'Pending'
    } ,
    status : {
        type: String,
        default: 'Pending', 
        required: true
    }
})

module.exports = mongoose.model ('Order' , orderSchema )