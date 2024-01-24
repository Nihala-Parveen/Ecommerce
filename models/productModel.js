const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const productSchema = mongoose.Schema ( {
    name : {
        type : String , 
        required : true
    } , 
    category : {
        type : mongoose.Types.ObjectId ,
        ref : 'Category'
    } , 
    description : {
        type : String ,
        required : true
    } , 
    price : {
        type : String , 
        required : true
    } , 
    discount : {
        type : String  
    } ,
    images : [
        {
            type : String ,
            required : true
        }
    ] ,
    quantity : {
        type : String 
    } ,
    isDeleted : {
        type : Boolean , 
        default : false
    }
})

module.exports = mongoose.model ("Product" , productSchema )