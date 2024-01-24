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
    isBlocked : {
        type : Boolean , 
        default : false
    }
})
module.exports = mongoose.model ('User', userSchema)