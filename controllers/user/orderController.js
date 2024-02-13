const Razorpay = require('razorpay')
const User = require('../../models/userModel')
const Order = require('../../models/orderModel')
const Cart = require('../../models/cartModel')
const Product = require('../../models/productModel')

const postOrder = async (req, res) => {
    try {
        const { userId, amount, payment } = req.body
        const products = JSON.parse(req.body.products)
        const selectedAddress = JSON.parse(req.body.address)
        const date = new Date()

        
        const [ cart , userData ] = await Promise.all ([ Cart.findOne({ userId }).populate('products.productId') , User.findById({ _id : userId }) ])
        const orderProducts = cart.products.map(cartItem => {
            return {
                productId: cartItem.productId._id,
                quantity: cartItem.quantity,
                price: cartItem.productId.price
            }
        })

        let errorMessages = []; 

        for (const cartItem of cart.products) {
            const product = await Product.findById(cartItem.productId)
            if (cartItem.quantity > product.stock) {
                errorMessages.push(`Quantity of product ${product.name} exceeds available stock`);
            }
        }

        if (errorMessages.length > 0) {
            console.log(errorMessages);
            return res.render('checkout', { carts: cart, users: userData, errorMessages });
        }

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
            date: date
        })
        await order.save()

        const orderData = await Order.findById(order._id).populate('products.productId', 'name')
        req.session.OrderId = orderData._id

        if (payment === "COD") {
            await Order.updateOne({ _id: orderData._id }, { $set: { payment: "COD" , status: "Placed" } })

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
            await Order.updateOne({ _id: orderData._id }, { $set: { payment : "Online Payment" } })
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
        await Order.updateOne({ _id : orderId , user : userId } , { $set : { status: "Placed" , paymentStatus : "Paid" , 'products.$[].status': "Placed" , 'products.$[].paymentStatus': "Paid" }}) 

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
        const orderData = await Order.find({user : userId}).populate('products.productId').sort({ date : -1 })

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
        await Order.findByIdAndUpdate(id , { $set : { status : "Cancelled" , 'products.$[].status': "Cancelled"}})
        const order = await Order.findById(id).populate('products.productId')
        for(orderProduct of order.products){
            const product = await Product.findById(orderProduct.productId)
            product.stock += orderProduct.quantity
            await product.save()
        }
        res.status(200).json({ message: 'Order successfully cancelled' });
    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.query;

        console.log('orderId:', orderId);
        console.log('itemId:', itemId);

        await Order.findOneAndUpdate(
            { _id: orderId, "products._id": itemId },
            { $set: { "products.$.status": "Cancelled" }}
        );

        const order = await Order.findById(orderId).populate('products.productId');

        console.log('order:', order);

        const allItemsCancelled = order.products.every(product => product.status === 'Cancelled');

        if (allItemsCancelled) {
            await Order.findByIdAndUpdate(orderId, { $set: { status: 'Cancelled' }});
        }
        
        res.status(200).json({ message: 'Item successfully cancelled' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    postOrder , 
    orderSuccess ,
    getOrders ,
    viewOrder ,
    cancelOrder , 
    verifyPayment ,
    cancelOrderItem
}