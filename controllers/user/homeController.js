const category = require('../../models/categoryModel')

const loadHome = async ( req , res ) => {
    try {
        res.render ('home' , {req})
    } catch (error) {
        console.log(error.message);
    }
}

const loginHome = async ( req , res ) => {
    try {
        const categoryData = await category.find()
        res.render('homelogin' , { categories : categoryData })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadHome ,
    loginHome
}