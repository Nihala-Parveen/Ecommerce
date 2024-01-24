const Order = require('../../models/orderModel')
const Cart = require('../../models/cartModel')

const postOrder = async ( req , res ) => {
    try {
        const { userId , amount , payment } = req.body
        const products = JSON.parse(req.body.products)
        const selectedAddress = JSON.parse(req.body.address)
        const date = new Date()

        const cart = await Cart.findOne({userId}).populate('products.productId')
        const orderProducts = cart.products.map(cartItem => {
            return {
                productId : cartItem.productId._id ,
                quantity : cartItem.quantity ,
                price : cartItem.price
            }
        })
        const order = new Order ( {
            user : userId ,
            products : orderProducts ,
            amount : amount , 
            address : {
                buildingName : selectedAddress.buildingName ,
                city : selectedAddress.city ,
                district : selectedAddress.district ,
                ZIPcode : selectedAddress.ZIPcode
            },
            date : date ,
            payment : payment
        })
        await order.save()
        
        if(cart){
            cart.products = []
            await cart.save()
        }
        
        const orderData = await Order.findById(order._id).populate('products.productId' , 'name')
        res.render('order' , { order : orderData })
    } catch (error) {
        console.log(error.message);
    }
}

const getOrders = async (req , res) => {
    try {
        const userId = req.session.user_id
        const orderData = await Order.find({user : userId}).populate('products.productId')
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
    getOrders ,
    viewOrder ,
    cancelOrder
}