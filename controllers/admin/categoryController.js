const category = require('../../models/categoryModel');

const loadAddCategory = async (req , res) => {
    try {
        res.render ('addcategory')
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req , res ) => {
    try {
        const name = req.body.catname

        //check if category name only contain letters
        if(!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(name)){
            return res.render('addcategory',{ message : "Category should only contain letters."})
        }

        //check if category already exists
        const existingCategory = await category.findOne({name})
        if(existingCategory){
            return res.render('addcategory' , {message : "Category already exists "})
        }

        const newCategory = new category ( {
            name ,
            image : req.file.filename
        })
        const categoryData = await newCategory.save()
    
        if(categoryData) {
            res.redirect('/viewcategory')
        } else {
            res.render ('addcategory' , { message : "Error while adding category "})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const viewCategory = async ( req , res ) => {
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

        const categoryData = await category.find( {
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }}
            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const count = await category.find({
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }} ,
                { email : { $regex : '.*'+search+'.*' }} ,
                { mobile : { $regex : '.*'+search+'.*' }} 
            ]
        }).countDocuments()

        res.render('viewcategory' , { 
            categories:categoryData ,
            totalPages : Math.ceil(count/limit) ,
            currentPage : page
        })
    } catch (error) {
        console.log(error.message);
    }
}

const editcategoryLoad = async ( req ,res ) => {
    try {
        const id = req.query.id
        const categoryData = await category.findById({_id:id})
        if(categoryData){
            res.render ('editcategory' , { category : categoryData } ) 
        } else {
            res.redirect ('/viewcategory')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async ( req , res ) => {
    try {
        const name = req.body.catname

        //check if category name only contain letters
        if(!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(name)){
            return res.render('editcategory',{ category : category , message : "Category should only contain letters."})
        }

        const updateData = {
            name 
        }
        if(req.file){
            updateData.image = req.file.filename
        }
        await category.findByIdAndUpdate(req.body.id  , {$set : updateData })
        res.redirect('/viewcategory')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async (req , res) => {
    try {
        const id = req.query.id
        await category.deleteOne({_id:id})
        res.redirect('/viewcategory')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadAddCategory , 
    addCategory , 
    viewCategory , 
    editcategoryLoad ,
    updateCategory ,
    deleteCategory
}
