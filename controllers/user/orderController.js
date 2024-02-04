const Razorpay = require('razorpay')
const Order = require('../../models/orderModel')
const Cart = require('../../models/cartModel')
const Product = require('../../models/productModel')



const postOrder = async (req, res) => {
    try {
        const { userId, amount, payment } = req.body
        const products = JSON.parse(req.body.products)
        const selectedAddress = JSON.parse(req.body.address)
        const date = new Date()

        const cart = await Cart.findOne({ userId }).populate('products.productId')
        const orderProducts = cart.products.map(cartItem => {
            return {
                productId: cartItem.productId._id,
                quantity: cartItem.quantity,
                price: cartItem.price
            }
        })

        const order = new Order({
            user: userId,
            products: orderProducts,
            amount: amount,
            address: {
                buildingName: selectedAddress.buildingName,
                city: selectedAddress.city,
                district: selectedAddress.district,
                ZIPcode: selectedAddress.ZIPcode
            },
            date: date,
            status: "Placed"
        })
        await order.save()

        const orderData = await Order.findById(order._id).populate('products.productId', 'name')
        req.session.OrderId = orderData._id

        if (payment === "COD") {
            await Order.updateOne({ _id: orderData._id }, { $set: { payment: "COD" } })

            for (const ordrProduct of orderProducts) {
                const product = await Product.findById(ordrProduct.productId)
                product.stock -= ordrProduct.quantity
                await product.save()
            }

            if (cart) {
                cart.products = []
                await cart.save()
            }
            res.send({ codsuccess: true, cod: true });
        } else if (payment === "onlinePayment") {
            var instance = new Razorpay({
                key_id: process.env.KEY_ID,
                key_secret: process.env.KEY_SECRET
            })

            var options = {
                amount: amount * 100,
                currency: "INR",
                receipt: "" + order._id
            }
            instance.orders.create(options, function (err, orders) {
                if (err) {
                    console.log("error in Online Payment", err);
                } else {
                    res.json({ success: true, order: orders })
                }
            })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyPayment = async ( req , res ) => {
    try {
        const orderId = req.session.OrderId
        const userId = req.session.user_id
        await Order.updateOne({ _id : orderId , user : userId } , { $set : { payment : "Online Payment "}}) 

        const order = await Order.findById(orderId).populate('products.productId')
        for(orderProduct of order.products){
            const product = await Product.findById(orderProduct.productId)
            product.stock -= orderProduct.quantity
            await product.save()
        }

        const cart = await Cart.findOne({userId})
        if(cart){
            cart.products = []
            await cart.save()
        }
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}

const orderSuccess = async ( req , res ) => {
    try {
        const userId = req.session.user_id
        const orderData = await Order.findOne({user:userId}).sort({date:-1}).populate('products.productId')
        res.render('order' , { order : orderData })
    } catch (error) {
        console.log(error.message);
    }
}

const getOrders = async (req , res) => {
    try {
        const userId = req.session.user_id
        const orderData = await Order.find({user : userId}).populate('products.productId')
        const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const monthlySales = await Order.aggregate([
    {
      $match: { status: "Delivered", date: { $gte: new Date(`${currentYear}-01-01`), $lt: new Date(`${currentYear + 1}-01-01`) } }
    },
    {
        $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $eq: [{ $month: "$date" }, 1] }, then: "Jan" },
                  { case: { $eq: [{ $month: "$date" }, 2] }, then: "Feb" },
                  { case: { $eq: [{ $month: "$date" }, 3] }, then: "Mar" },
                  { case: { $eq: [{ $month: "$date" }, 4] }, then: "Apr" },
                  { case: { $eq: [{ $month: "$date" }, 5] }, then: "May" },
                  { case: { $eq: [{ $month: "$date" }, 6] }, then: "Jun" },
                  { case: { $eq: [{ $month: "$date" }, 7] }, then: "Jul" },
                  { case: { $eq: [{ $month: "$date" }, 8] }, then: "Aug" },
                  { case: { $eq: [{ $month: "$date" }, 9] }, then: "Sep" },
                  { case: { $eq: [{ $month: "$date" }, 10] }, then: "Oct" },
                  { case: { $eq: [{ $month: "$date" }, 11] }, then: "Nov" },
                  { case: { $eq: [{ $month: "$date" }, 12] }, then: "Dec" },
                ],
                default: null
              }
            },
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: "$amount" }
          }
          
    }
  ])
  
const d = monthlySales.map((o) => o._id)
const a = monthlySales.map((e) => e.totalSales)
const r = monthlySales.map((or) => or.totalRevenue )
console.log("Month",d);
console.log("Sales",a);
console.log("Revenue" , r);


        if(orderData){
            res.render('orderdetails' , { orders : orderData })
        } 
    } catch (error) {
        console.log(error.message);
    }
}

const viewOrder = async ( req , res ) => {
    try {
        const orderData = await Order.findById({_id:req.query.id}).populate('user').populate('address').populate('products.productId')
        if(orderData){
            res.render('vieworder' , { orders : orderData })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrder = async ( req , res ) => {
    try {
        const { id } = req.query
        await Order.findByIdAndUpdate(id , { $set : { status : "Cancelled"}})
        res.status(200).json({ message: 'Order successfully cancelled' });
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    postOrder , 
    orderSuccess ,
    getOrders ,
    viewOrder ,
    cancelOrder , 
    verifyPayment
}