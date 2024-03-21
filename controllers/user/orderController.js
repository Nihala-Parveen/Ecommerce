const Razorpay = require('razorpay')
const PDFDocument = require('pdfkit')
const User = require('../../models/userModel')
const Order = require('../../models/orderModel')
const Cart = require('../../models/cartModel')
const Product = require('../../models/productModel')
const Coupon = require('../../models/couponModel')

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
})

const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user_id
        const { code, subTotal } = req.body

        const usedCoupon = await Order.findOne ( { user : userId , "coupon.couponCode" : code })
        if ( usedCoupon ) {
            return res.json ( { success : false , message : "Coupon already used."})
        }

        const coupon = await Coupon.findOne({ couponCode: code, status: "Active" })
        if (coupon) {
            const couponExp = coupon.expiryDate
            const date = new Date()
            if (couponExp > date) {
                const subTotalNumber = parseFloat(subTotal.replace(/[^\d.]/g, ''));
                if (coupon.minAmount <= subTotalNumber) {
                    req.session.coupon = coupon.couponCode
                    req.session.discount = coupon.discountAmount

                    const amount = coupon.discountAmount
                    const totalAmount = subTotalNumber - amount

                    res.json({ success: true, subTotal: totalAmount , discount: amount })
                } else {
                    res.json({ success: false, message: "Minimum amount not met." })
                }
            } else {
                await Coupon.updateOne(
                    { couponCode: code },
                    { $set: { status: "Expired" } }
                )
                res.json({ success: false, message: "Coupon Expired" })
            }
        } else {
            res.json({ success: false, message: "Coupon code not matching." })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const viewCoupons = async ( req , res ) => {
    try {
        const couponData = await Coupon.find({ status : "Active" })
        res.render('viewCoupon' , { couponData } )
    } catch (error) {
        console.log(error.message);
    }
}

const postOrder = async (req, res) => {
    try {
        const { userId, amount, payment } = req.body
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
            return res.send({ outOfStock : true, message : errorMessages });   
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
            date: date ,
            coupon : {
                couponCode : req.session.coupon , 
                couponDiscount : req.session.discount
            }
        })
        await order.save()

        const orderData = await Order.findById(order._id).populate('products.productId', 'name')
        req.session.orderSuccess = orderData._id

        if (payment === "COD") {
            await Order.updateOne({ _id: orderData._id }, { $set: { payment: "Cash on Delivery" , status: "Placed" , 'products.$[].status': "Placed" } })

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
        } else {
            await Promise.all([
                Order.updateOne({ _id: orderData._id }, { $set: { payment : "Wallet Payment" , status : "Placed" , paymentStatus : "Paid" , 'products.$[].status': "Placed" } }) ,
                User.updateOne({ _id : userId } , { $inc : { wallet : -amount }})
            ])
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
        }
    } catch (error) {
        console.log(error.message);
    }
}

const continuePayment = async ( req , res ) => {
    try {
        const { orderId } = req.body
        const order = await Order.findById(orderId)
        var options = {
            amount: order.amount * 100,
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
    } catch (error) {
        console.log(error.message);
    }
}

const verifyPayment = async ( req , res ) => {
    try {
        const orderId = req.body.order
        req.session.orderSuccess = orderId
        const userId = req.session.user_id
        const order = await Order.findById(orderId).populate('products.productId')

        const up = await Order.updateOne({ _id : orderId , user : userId } , { $set : { status: "Placed" , paymentStatus : "Paid" , 'products.$[].status': "Placed" , 'products.$[].paymentStatus': "Paid" }}) 
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
        const orderId = req.session.orderSuccess
        const orderData = await Order.findOne({_id : orderId , user:userId}).populate('products.productId')
        res.render('order' , { order : orderData })
    } catch (error) {
        console.log(error.message);
    }
}

const getOrders = async (req , res) => {
    try {
        var page = 1
        if(req.query.page){
            page = parseInt(req.query.page , 10 )
        }

        const limit = 3

        const userId = req.session.user_id
        const userData = await User.findById({_id:userId})
        const orderData = await Order.find({
            user : userId
        }).populate('products.productId')
        .sort({ date : -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const count = await Order.find({
            user : userId
        }).populate('products.productId')
        .sort({ date : -1 })
        .countDocuments()

        if (orderData) {
            res.render('orderdetails', {
                orders: orderData,
                users: userData,
                totalPages: Math.ceil(count / limit),
                currentPage : page
            })
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
        const userId = req.session.user_id
        const { id } = req.query
        const orderCheck = await Order.findOne({_id : id})
        const order = await Order.findById(id).populate('products.productId')
        if(orderCheck.paymentStatus == "Paid"){
            await Promise.all([
                User.updateOne({ _id : userId } , { $inc : { wallet : orderCheck.amount }}) ,
                Order.updateOne({ _id : id } , { $set : { status : "Cancelled" , 'products.$[].status': "Cancelled" , paymentStatus : "Refunded" ,'products.$[].paymentStatus' : "Refunded" }})
            ])
        } else {
            await Order.updateOne({ _id : id } , { $set : { status : "Cancelled" , 'products.$[].status': "Cancelled"}} )
        }
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

const returnOrder = async ( req , res ) => {
    try {
        const { id } = req.query
        await Order.findByIdAndUpdate ( id , { $set : { status : "Return Requested" , 'products.$[].status': "Return Requested"}})
        res.status(200).json({ message: 'Order successfully returned' });
    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrderItem = async (req, res) => {
    try {
        const userId = req.session.user_id
        const { productId, orderId } = req.body;

        const order = await Order.findOneAndUpdate(
            { _id: orderId, "products._id": productId },
            { $set: { "products.$.status": "Cancelled" }} ,
            { new: true }
        );

        const cancelledProduct = order.products.find(product => product._id.toString() === productId);
        const newAmount = order.amount - (cancelledProduct.price * cancelledProduct.quantity);
        if ( order.paymentStatus === "Paid") {
            await Promise.all([
                User.updateOne({ _id : userId } , { $inc : { wallet : cancelledProduct.price * cancelledProduct.quantity }}) ,
                Order.updateOne({ _id : orderId , "products._id": productId } , { $set : { 'products.$.paymentStatus' : "Refunded" }})
            ])
        }

        const updateStock = await Product.findById(cancelledProduct.productId)
        updateStock.stock += cancelledProduct.quantity
        updateStock.save()

        const allItemsCancelled = order.products.every(product => product.status === 'Cancelled');
        if (allItemsCancelled) {
            if ( order.paymentStatus === "Paid") {
                await Order.findOneAndUpdate( { _id : orderId } , { $set: { status: 'Cancelled' , paymentStatus : "Refunded" }} , { new: true });
            } else {
                await Order.findOneAndUpdate( { _id : orderId } , { $set: { status: 'Cancelled' }} , { new: true });
            }
        } else {
            await Order.findOneAndUpdate({ _id: orderId }, { $set: { amount: newAmount } }, { new: true });
        }
        res.status(200).json({ message: 'Item successfully cancelled' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function createInvoice(invoice) {
    return new Promise((resolve, reject) => {
        let doc = new PDFDocument({ size: "A4", margin: 50 });

        generateHeader(doc);
        generateCustomerInformation(doc, invoice);
        generateInvoiceTable(doc, invoice);

        doc.end();
        resolve(doc)
    });
}

  
  function generateHeader(doc) {
    doc
      .fontSize(20)
      .text("ShopEasy", 110, 57)
      .fontSize(10)
      .text("ShopEasy", 200, 50, { align: "right" })
      .text("Ahmedabad", 200, 65, { align: "right" })
      .text("Gujarat, 610025", 200, 80, { align: "right" })
      .moveDown();
  }
  
  function generateCustomerInformation(doc, invoice) {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 50, 160);
  
    generateHr(doc, 185);
  
    const customerInformationTop = 200;
  
    doc
      .fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(invoice.invoice_nr, 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInformationTop + 15)
      .text(invoice.date , 150, customerInformationTop + 15)
      .text("Order Id:", 50, customerInformationTop + 30)
      .text(
        invoice.id,
        150,
        customerInformationTop + 30
      )
  
      .font("Helvetica-Bold")
      .text(invoice.shipping.name, 300, customerInformationTop)
      .font("Helvetica")
      .text(invoice.shipping.address, 300, customerInformationTop + 15)
      .text(
        invoice.shipping.city +
          ", " +
          invoice.shipping.state +
          ", " +
          invoice.shipping.postal_code,
        300,
        customerInformationTop + 30
      )
      .moveDown();
  
    generateHr(doc, 252);
  }
  
  function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;
  
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Description",
      "Price",
      "Quantity",
      "Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
  
    for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        item.item,
        item.description,
        item.amount,
        item.quantity,
        item.amount * item.quantity
      );
  
      generateHr(doc, position + 20);
    }
  
    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Subtotal",
      "",
      invoice.subtotal
    );
  }
  
  
  function generateTableRow(
    doc,
    y,
    item,
    description,
    price,
    quantity,
    Total
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y)
      .text(price, 280, y, { width: 90, align: "right" })
      .text(quantity, 370, y, { width: 90, align: "right" })
      .text(Total, 0, y, { align: "right" });
  }
  
  function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  const downloadInvoice = async (req, res) => {
    try {
        const orderData = await Order.findById(req.query.id).populate('user').populate('address').populate('products.productId');
        
        if (!orderData) {
            return res.status(404).send('Order not found');
        }

        const invoiceNumber = `INV${orderData._id.toString().slice(-8)}`;
        
        const invoice = {
            shipping: {
                name: orderData.user.name,
                address: orderData.address.buildingName,
                city: orderData.address.city,
                state: orderData.address.district,
                postal_code: orderData.address.ZIPcode
            },
            items: orderData.products.map(product => ({
                item: product.productId.name,
                description: product.productId.description.slice(0,30)+"...",
                quantity: product.quantity,
                amount: product.price
            })),
            subtotal: orderData.amount,
            date : orderData.date.toLocaleDateString('en-GB') ,
            invoice_nr: invoiceNumber ,
            id : orderData._id
        };

        // Create the invoice and wait for it to be created
        createInvoice(invoice)
        .then((doc) => {
            // Stream the PDF directly to the response for download
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
            doc.pipe(res);
        })
        .catch((err) => {
            console.error("Error creating invoice:", err);
            res.status(500).end();
        });
    } catch (err) {
        console.error("Error retrieving order data:", err);
        res.status(500).end();
    }
};



module.exports = {
    applyCoupon ,
    viewCoupons ,
    postOrder , 
    orderSuccess ,
    getOrders ,
    viewOrder ,
    cancelOrder , 
    returnOrder ,
    continuePayment ,
    verifyPayment ,
    cancelOrderItem ,
    downloadInvoice
}