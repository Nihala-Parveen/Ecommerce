const { ObjectId } = require("mongodb")
const mongoose = require ("mongoose")

const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true
    },
    email : {
        type : String ,
        unique : true ,
        required : true 
    },
    mobile : {
        type : String ,
        unique : true ,
        required : true 
    },
    password : {
        type : String ,
        required : true
    },
    address : [ {
        buildingName : {
            type : String , 
            required : true
        } ,
        city : {
            type : String , 
            required : true
        } , 
        district : {
            type : String , 
            required : true
        } ,
        ZIPcode : {
            type : String , 
            required : true
        } ,
    }],
    wishlist : [ {
        products : {
            type : mongoose.Types.ObjectId ,
            ref : 'Product'
        }
    } ] ,
    isBlocked : {
        type : Boolean , 
        default : false
    } ,
    wallet : { 
        type : Number ,
        default : 0
    } ,
    referralCode : {
        type : String ,
        required : true
    } ,
    token : {
        type : String ,
        default : ''
    } 
})
module.exports = mongoose.model ('User', userSchema)