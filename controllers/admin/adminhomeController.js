const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Order = require('../../models/orderModel') 

const loadHome = async ( req , res ) => {
    try {
        const [ userCount , productCount , orderCount , revenue , sales ] = await Promise.all([ User.find().count() , Product.find().count() , Order.find().count() , Order.aggregate([ { $match : {status:"Delivered"}}, { $group : { _id: null, totalIncome: { $sum: "$amount" } }}]) , Order.find({status:"Delivered"}).count() ])
        let totalPrice;
        if (revenue.length > 0) {
          totalPrice = revenue[0].totalIncome;
        }
        res.render ('home' , { userCount , productCount , orderCount , revenue , totalPrice , sales })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadHome
}