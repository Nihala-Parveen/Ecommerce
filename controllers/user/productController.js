const category = require ('../../models/categoryModel')
const product = require ('../../models/productModel')

const productLoad = async ( req , res ) => {
    try {
        var page = 1
        if(req.query.page){
            page = parseInt(req.query.page , 10)
        }

        const limit = 8

        const categoryData = await category.find()
        const productData = await product.find({isDeleted : false})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const count = await product.find().countDocuments()
        res.render ('productlist' , { 
            products : productData , 
            categories : categoryData ,
            totalPages : Math.ceil(count/limit) ,
            currentPage : page
        })
    } catch (error) {
        console.log(error.message);
    }
}

const categoryLoad = async ( req , res ) => {
    try {
        const categoryData = await category.find()
        res.render('category' , { categories : categoryData })
    } catch (error) {
        console.log(error.message);
    }
}

const productbycategoryLoad = async ( req , res ) => {
    try {
        const productData = await product.find({ category : req.query.category , isDeleted : false })    
        res.render('product' , { products : productData })  
    } catch (error) {
        console.log(error.message);
    }
}

const productDetails = async ( req , res ) => {
    try {
        const productData = await product.findById({_id:req.query.id}).populate('category')
        if(productData) {
            res.render ('productdetails' , { products : productData} )
        } else { 
            res.redirect ('/product')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    productLoad ,
    categoryLoad ,
    productbycategoryLoad ,
    productDetails
}