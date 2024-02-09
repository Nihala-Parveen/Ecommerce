const PDFDocument = require('pdfkit')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Order = require('../../models/orderModel') 

const loadHome = async ( req , res ) => {
    try {
        const [ userCount , productCount , orderCount , revenue , sales ] = await Promise.all([ 
            User.find().count() , 
            Product.find().count() , 
            Order.find().count() , 
            Order.aggregate([ { $match : {status:"Delivered"}}, { $group : { _id: null, totalIncome: { $sum: "$amount" } }}]) , 
            Order.find({status:"Delivered"}).count() 
        ])
        let totalPrice;
        if (revenue.length > 0) {
          totalPrice = revenue[0].totalIncome;
        }

        //to display graph
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()

        const salesAndRevenue = await Order.aggregate([
            {
                $match : { status : "Delivered" , date : { $gte : new Date(`${currentYear}-01-01`) , $lt : new Date(`${currentYear + 1 }-01-01`)}}
            } ,
            {
                $group : {
                    _id : {
                        $switch : {
                            branches : [
                                { case : { $eq : [{ $month : "$date"} , 1] }, then : "Jan"} ,
                                { case : { $eq : [{ $month : "$date"} , 2] }, then : "Feb"} ,
                                { case : { $eq : [{ $month : "$date"} , 3] }, then : "Mar"} ,
                                { case : { $eq : [{ $month : "$date"} , 4] }, then : "Apr"} ,
                                { case : { $eq : [{ $month : "$date"} , 5] }, then : "May"} ,
                                { case : { $eq : [{ $month : "$date"} , 6] }, then : "Jun"} ,
                                { case : { $eq : [{ $month : "$date"} , 7] }, then : "Jul"} ,
                                { case : { $eq : [{ $month : "$date"} , 8] }, then : "Aug"} ,
                                { case : { $eq : [{ $month : "$date"} , 9] }, then : "Sep"} ,
                                { case : { $eq : [{ $month : "$date"} , 10] }, then : "Oct"} ,
                                { case : { $eq : [{ $month : "$date"} , 11] }, then : "Nov"} ,
                                { case : { $eq : [{ $month : "$date"} , 12] }, then : "Dec"} 
                            ] ,
                            default : null
                        }
                    } ,
                    totalSales : { $sum : 1 },
                    totalRevenue : { $sum : "$amount" }
                }
            }
        ])
        const month = salesAndRevenue.map((month) => month._id )
        const Sales = salesAndRevenue.map((sale) => sale.totalSales )
        const Revenue = salesAndRevenue.map((revenue) => revenue.totalRevenue )
       
        res.render ('home' , { 
            userCount , 
            productCount , 
            orderCount , 
            revenue , 
            totalPrice , 
            sales ,
            month ,
            Sales , 
            Revenue
        })
    } catch (error) {
        console.log(error.message);
    }
}

const getSalesReport = async ( req , res ) => {
    try {
        const timeRange = req.body.timeRange
        let fromDate , toDate

        if(timeRange === "daily") {
            fromDate = new Date()
            fromDate.setDate(fromDate.getDate() - 1)
            toDate = new Date()
        } else if(timeRange === "weekly") {
            fromDate = new Date()
            fromDate.setDate(fromDate.getDate() - 7)
            toDate = new Date()
        } else if(timeRange === "yearly"){
            fromDate = new Date() 
            fromDate.setFullYear(fromDate.getFullYear() - 1)
            toDate = new Date()
        } else {
            return res.render('home')
        }

        const salesData = await Order.find({
            status : "Delivered" ,
            date : {
                $gte : fromDate ,
                $lte : toDate
            }
        }).populate("products.productId")

        res.render("salesReport" , { salesData , fromDate , toDate })
    } catch (error) {
        console.log(error.message);
    }
}

const downloadSalesReport = async (req, res) => {
    try {
        let { fromDate, toDate } = req.body;
        fromDate = new Date(fromDate);
        toDate = new Date(toDate);
        
        const salesData = await Order.find({ status: "Delivered" }).populate('products.productId')
        
        var filename = "orders_" + fromDate.toISOString() + "_" + toDate.toISOString() + ".pdf";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');
        
        const doc = new PDFDocument();
        doc.text("#", { align: "center" });
        doc.text("DATE", { align: "center" });
        doc.text("PRODUCT", { align: "center" });
        doc.text("QUANTITY", { align: "center" });
        doc.text("PRICE", { align: "center" });
        doc.text("PAYMENT METHOD", { align: "center" });
        doc.text("TOTAL AMOUNT", { align: "center" });

        salesData.forEach((sale, index) => {
            var orderDate = new Date(sale.date);
            if (orderDate >= fromDate && orderDate <= toDate) {
                doc.text((index + 1).toString(), { align: "center" });
                doc.text(sale.date.toLocaleDateString(), { align: "center" });
                
                let products = "";
                let quantities = "";
                let prices = "";

                sale.products.forEach((product) => {
                    products += product.productId.name + "\n";
                    quantities += product.quantity + "\n";
                    prices += product.price + "\n";
                });

                doc.text(products, { align: "center" });
                doc.text(quantities, { align: "center" });
                doc.text(prices, { align: "center" });

                doc.text(sale.payment, { align: "center" });
                doc.text(sale.amount, { align: "center" });

                doc.moveDown();
            }
        });

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    loadHome ,
    getSalesReport , 
    downloadSalesReport
}