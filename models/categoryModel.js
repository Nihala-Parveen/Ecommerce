const { ObjectId } = require("mongodb")
const mongoose = require ('mongoose')

const categorySchema = mongoose.Schema ( {
    name : {
        type : String , 
        required : true
    } ,
    image : {
        type : String , 
        required : true
    } 
})

module.exports = mongoose.model ('Category' , categorySchema )