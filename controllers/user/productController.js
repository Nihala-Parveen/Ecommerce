const User = require('../../models/userModel')
const category = require ('../../models/categoryModel')
const product = require ('../../models/productModel')

const productLoad = async ( req , res ) => {
    try {
        var search = ''
        if(req.query.search){
            search = req.query.search
        }

        var page = 1
        if(req.query.page){
            page = parseInt(req.query.page , 10)
        }

        const limit = 8

        const categoryData = await category.find()
        const user = await User.findOne({ _id: req.session.user_id })
        let wishlistData = null
        if (user) {
            wishlistData = await user.populate('wishlist.products')
        }

        let sortQuery = {}; 
        if (req.query.sort === 'priceAsc') {
            sortQuery = { price: 1 }; 
        } else if (req.query.sort === 'priceDesc') {
            sortQuery = { price: -1 }; 
        }

        const productData = await product.find({ isDeleted : false ,
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }}
            ]
        })
        .sort(sortQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const count = await product.find({
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }}
            ]
        }).countDocuments()
        const wishId = wishlistData ? wishlistData.wishlist.map(
            (wishlistItem) => wishlistItem.products._id
        ) : [];
        res.render ('productlist' , { 
            user : req.session.user_id ,
            products : productData , 
            wishId ,
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
            res.render ('productdetails' , { products : productData , user : req.session.user_id } )
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