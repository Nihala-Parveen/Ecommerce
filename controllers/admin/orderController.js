const Order = require('../../models/orderModel')

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

        const limit = 3

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

        if (order.payment === 'COD' && newStatus === 'Delivered') {
            await Order.findByIdAndUpdate(id, { $set: { paymentStatus: 'Paid' } });
        } 
        
        res.redirect('/view-orders')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    viewOrder ,
    orderDetails ,
    changeStatusLoad ,
    changeStatus
}