const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const cartSchema = mongoose.Schema ( {
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
      },
      products: [
        {
          productId: {
            type: mongoose.Types.ObjectId,
            ref: "Product"
          },
          quantity: {
            type : Number , 
            default : 1
          } ,
          price : {
            type : Number ,
            required : true
         }
        }
      ] 
})

module.exports = mongoose.model("Cart" , cartSchema )