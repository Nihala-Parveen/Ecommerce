const Order = require('../../models/orderModel')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')

const viewOrder = async ( req , res ) => {
    try {
        var search = ''
        if(req.query.search){
            search = req.query.search
        }

        var page = 1
        if(req.query.page){
            page = parseInt(req.query.page , 10 )
        }

        const limit = 10

        const orderData = await Order.find({
            $or : [
                { status : { $regex : '.*'+search+'.*' , $options : 'i' }}
            ]
        }).populate('user')
        .sort({date:-1})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const count = await Order.find({
            $or : [
                { status : { $regex : '.*'+search+'.*' , $options : 'i' }}
            ]
        }).populate('user')
        .sort({date:-1})
        .countDocuments()

        res.render('vieworder' , { 
            orders : orderData ,
            totalPages : Math.ceil(count/limit) ,
            currentPage : page
        })
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetails = async ( req , res ) => {
    try {
        const orderData = await Order.findById({_id:req.query.id}).populate('products.productId').populate('user')
        if(orderData){
            res.render('orderdetails' , { orders : orderData})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const changeStatusLoad = async ( req , res ) => {
    try {
        const id = req.query.id
        const orderData = await Order.findById({_id:id})
        if(orderData){
            res.render('changestatus' , { order : orderData })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const changeStatus = async ( req , res ) => {
    try {
        const id = req.query.id
        const newStatus = req.body.status
        const order =  await Order.findByIdAndUpdate( id , {$set : { status : newStatus }})

        order.products.forEach((product) => {
            if(product.status !== "Cancelled") {
                product.status = newStatus
            }
        })
        await order.save()

        if (order.payment === 'Cash on Delivery' && newStatus === 'Delivered') {
            order.paymentStatus = "Paid"
            order.save()
        } 
        
        const user = order.user
        
        if ( newStatus === "Returned") {
            await User.findOneAndUpdate({ _id : user } , { $inc : { wallet : order.amount }})
            order.paymentStatus = "Refunded"
            await order.save()
            order.products.forEach(async (item) => {
                await Product.updateOne({ _id : item.productId } , { $inc : { stock : item.quantity }})
            })
        }

        res.redirect('/view-orders')
    } catch (error) {
        console.log(error.message);
    }
}

const getChangeProductStatus = async ( req , res ) => {
    try {
        const { id , productId } = req.query
        const orderData = await Order.findOne({_id:id , "products._id" : productId })
        if(orderData){
            res.render('changeProductstatus' , { order : orderData })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const changeProductStatus = async ( req , res ) => {
    try {
        const { id , productId , status } = req.body
        const order =  await Order.findOneAndUpdate(
            { _id : id , "products._id": productId } ,
            { $set : { "products.$.status": status }} ,
            { new : true }
        )

        const allItemsChanged = order.products.every(product => product.status === status )
        if(allItemsChanged){
            if ( order.payment === 'Cash on Delivery' && status === "Delivered" ) {
                await Order.findOneAndUpdate( { _id : id } , { $set: { status: status , paymentStatus : "Paid" }} , { new: true });
            } else {
                await Order.findOneAndUpdate({ _id : id } , { $set : { status : status }} , { new : true })
            }
        }

        if (order.payment === 'Cash on Delivery' && status === 'Delivered') {
            order.products.paymentStatus = "Paid"
            order.save()
        } 
        
        const user = order.user
        
        if ( status === "Returned") {
            await Promise.all(order.products.map(async (item) => {
                if (item._id.toString() === productId && item.status === 'Returned') {
                    const refundAmount = item.price * item.quantity; // Refund amount for the returned product
                    await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
                    await User.findOneAndUpdate({ _id: user }, { $inc: { wallet: refundAmount } });
                    item.paymentStatus = "Refunded";
                }
            }));
            await order.save();
        }

        res.redirect(`/order-details?id=${order._id}`)
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    viewOrder ,
    orderDetails ,
    changeStatusLoad ,
    changeStatus ,
    getChangeProductStatus ,
    changeProductStatus
}