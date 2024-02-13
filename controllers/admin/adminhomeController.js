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

const calculateTopSellingProducts = async ( req , res ) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.productId',
                    totalSold: { $sum: '$products.quantity' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    name: '$product.name',
                    totalSold: 1
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

        res.render('top-products' , { topProducts })
    } catch (error) {
        throw error;
    }
}

const calculateTopSellingCategory = async ( req , res ) => {
    try {
        const topCategory = await Order.aggregate([
            { $unwind : '$products' } ,
            {
                $lookup : {
                    from : 'products' ,
                    localField : 'products.productId' ,
                    foreignField : '_id' ,
                    as : 'productDetails'
                }
            } ,
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.category',
                    totalSold: { $sum: '$products.quantity' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            } ,
            { $unwind : '$categoryDetails' } ,
            {
                $project : {
                    categoryName : '$categoryDetails.name' ,
                    totalSold : 1
                }
            } , 
            { $sort : { totalSold : -1 } }
        ])  
        
        res.render('top-category' , { topCategory })

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
        
        const salesData = await Order.find({ status: "Delivered" }).populate('products.productId');
        
        var filename = "orders_" + fromDate.toISOString() + "_" + toDate.toISOString() + ".pdf";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');
        
        const doc = new PDFDocument();
        doc.pipe(res);
        
        // Set up table properties
        const tableTop = 100;
        const rowHeight = 30;
        const colWidth = (doc.page.width - 100) / 6; // Adjusted width
        
        // Draw table headers
        doc.fontSize(12);
        doc.text("#", 50, tableTop);
        doc.text("DATE", 50 + colWidth, tableTop);
        doc.text("PRODUCT", 50 + colWidth * 2, tableTop);
        doc.text("QUANTITY", 50 + colWidth * 3, tableTop);
        doc.text("PRICE", 50 + colWidth * 4, tableTop);
        doc.text("PAYMENT METHOD", 50 + colWidth * 5, tableTop);
        doc.text("TOTAL AMOUNT", 50 + colWidth * 6, tableTop);
        
        let rowIndex = 1;
        let yPos = tableTop + rowHeight;
        salesData.forEach((sale) => {
            var orderDate = new Date(sale.date);
            if (orderDate >= fromDate && orderDate <= toDate) {
                // Draw table rows
                doc.text(rowIndex.toString(), 50, yPos, { width: colWidth, height: rowHeight, align: 'center' });
                doc.text(sale.date.toLocaleDateString(), 50 + colWidth, yPos, { width: colWidth, height: rowHeight, align: 'center' });
                
                let products = "";
                let quantities = "";
                let prices = "";

                sale.products.forEach((product) => {
                    products += product.productId.name + "\n";
                    quantities += product.quantity + "\n";
                    prices += product.price + "\n";
                });

                doc.text(products, 50 + colWidth * 2, yPos, { width: colWidth, height: rowHeight, align: 'center' }); 
                doc.text(quantities, 50 + colWidth * 3, yPos, { width: colWidth, height: rowHeight, align: 'center' }); 
                doc.text(prices, 50 + colWidth * 4, yPos, { width: colWidth, height: rowHeight, align: 'center' });

                doc.text(sale.payment, 50 + colWidth * 5, yPos, { width: colWidth, height: rowHeight, align: 'center' }); 
                doc.text(sale.amount, 50 + colWidth * 6, yPos, { width: colWidth, height: rowHeight, align: 'center' }); 

                yPos += rowHeight;
                rowIndex++;
            }
        });

        // Draw table lines
        doc.moveTo(50, tableTop).lineTo(50 + colWidth * 7, tableTop).stroke(); // Top horizontal line
        for (let i = 1; i <= rowIndex; i++) {
            doc.moveTo(50, tableTop + i * rowHeight).lineTo(50 + colWidth * 7, tableTop + i * rowHeight).stroke(); // Horizontal lines
        }
        for (let j = 1; j < 7; j++) {
            doc.moveTo(50 + j * colWidth, tableTop).lineTo(50 + j * colWidth, tableTop + rowIndex * rowHeight).stroke(); // Vertical lines
        }

        doc.end();
    } catch (error) {
        console.log(error.message);
    }
};




module.exports = {
    loadHome ,
    calculateTopSellingProducts ,
    calculateTopSellingCategory ,
    getSalesReport , 
    downloadSalesReport
}