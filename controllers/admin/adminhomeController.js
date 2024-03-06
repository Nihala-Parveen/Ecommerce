const PDFDocument = require('pdfkit')
const ExcelJs = require('exceljs')
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

const chartFilter = async ( req , res ) => {
    try {
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()

        const yearlyRevenue = await Order.aggregate([
            {
                $match: {
                    status: "Delivered",
                    date: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: { $year: "$date" },
                    totalRevenue: { $sum: "$amount" }
                }
            }
        ]);
        
        const monthlyRevenue = await Order.aggregate([
            {
                $match : { 
                    status : "Delivered" , 
                    date : { 
                        $gte : new Date(currentYear, 0, 1) , 
                        $lt : new Date(currentYear + 1, 0, 1)
                    }
                }
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
                    totalRevenue : { $sum : "$amount" }
                }
            }
        ])

        const weeklyRevenue = await Order.aggregate([
            {
                $match: {
                    status: "Delivered",
                    date: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: {
                                $dateFromParts: {
                                    isoWeekYear: { $year: "$date" },
                                    isoWeek: { $isoWeek: "$date" },
                                    isoDayOfWeek: 1  // Monday is the first day of the week
                                }
                            }
                        }
                     },
                    totalRevenue: { $sum: "$amount" }
                }
            }
        ]);
        
        res.json({
            yearly : yearlyRevenue , 
            monthly : monthlyRevenue , 
            weekly : weeklyRevenue 
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

const getCustomDateSales = async ( req , res ) => {
    try {
        let { fromDate , toDate } = req.body
        fromDate = new Date(fromDate)
        toDate = new Date(toDate)
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

        const salesData = await Order.find({ status: "Delivered" }).populate('user').populate('products.productId');

        var filename = "orders_" + fromDate.toISOString() + "_" + toDate.toISOString() + ".pdf";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');

        const doc = new PDFDocument();
        doc.pipe(res);
        doc.text("SALES REPORT", { align: "center", fontSize: 20, bold: true });
        doc.fontSize(12);
        const margin = 5;
        doc
            .moveTo(margin, margin)
            .lineTo(600 - margin, margin)
            .lineTo(600 - margin, 842 - margin)
            .lineTo(margin, 842 - margin)
            .lineTo(margin, margin)
            .lineTo(600 - margin, margin)
            .lineWidth(3)
            .strokeColor("#000000")
            .stroke();

        doc.moveDown();

        const headers = ["#", "USER", "DATE", "PAYMENT", "TOTAL"];

        let headerX = 20;
        const headerY = doc.y + 10;

        doc.text(headers[0], headerX, headerY)
        headerX += 50

        headers.slice(1).forEach((header) => {
            doc.text(header, headerX, headerY);
            headerX += 143;
        });

        let dataY = headerY + 25;

        let y = headerY + 15;

        salesData.forEach((sale, index) => {
            var orderDate = new Date(sale.date);
            if (orderDate >= fromDate && orderDate <= toDate) {
                doc.text(index + 1, 20, dataY)
                doc.text(sale.user.name, 70, dataY)
                doc.text(sale.date.toLocaleDateString(), 213, dataY)
                doc.text(sale.payment, 358, dataY)
                doc.text(sale.amount, 10, dataY, { align: 'right' })

                dataY += 30
                doc
                    .moveTo(10, y)
                    .lineTo(560, y)
                    .lineWidth(1) 
                    .strokeColor("#000000") 
                    .stroke();

                y = dataY - 10;

            }
        })

        doc.moveTo(10, headerY - 10)
            .lineTo(10, dataY)
            .lineTo(560, dataY)
            .lineTo(560, headerY - 10)
            .lineTo(10, headerY - 10)
            .lineWidth(1)
            .stroke();

        const xPositions = [50, 190, 320, 465];
        xPositions.forEach((x) => {
            doc
                .moveTo(x, headerY - 10)
                .lineTo(x, dataY)
                .strokeColor("#000000")
                .stroke();
        });

        doc.end();
    } catch (error) {
        console.log(error.message);
    }
};

const downloadExcelReport = async (req, res) => {
    try {
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        const salesData = await Order.find({ status: "Delivered" }).populate('user').populate('products.productId');

        worksheet.columns = [
            { header: '#', key: 'index', width: 5 },
            { header: 'USER', key: 'user', width: 30 },
            { header: 'DATE', key: 'date', width: 30 },
            { header: 'PAYMENT', key: 'payment', width: 15 },
            { header: 'TOTAL', key: 'total', width: 15 },
        ];

        let { fromDate, toDate } = req.body;
        fromDate = new Date(fromDate);
        toDate = new Date(toDate);

        salesData.forEach((sale, index) => {
            var orderDate = new Date(sale.date);
            if (orderDate >= fromDate && orderDate <= toDate) {
                worksheet.addRow({
                    index: index + 1,
                    user: sale.user.name,
                    date: sale.date.toLocaleDateString(),
                    payment: sale.payment,
                    total: sale.amount,
                });
            }
        });

        var filename = "orders_" + fromDate.toISOString() + "_" + toDate.toISOString() + ".xlsx";

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + filename);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadHome ,
    chartFilter ,
    calculateTopSellingProducts ,
    calculateTopSellingCategory ,
    getSalesReport , 
    getCustomDateSales ,
    downloadSalesReport ,
    downloadExcelReport
}