const product = require ('../../models/productModel')
const category = require ('../../models/categoryModel')

const loadaddProduct = async ( req , res) => {
    try {
        const categories = await category.find({} , 'id , name')
        res.render('addproduct' , { categories , errors: {} })
    } catch (error) {
        console.log(error.message);
    }
} 

const addProduct = async ( req , res ) => {
    try {
        // Validation logic
        let errors = {};
        let isValid = true;

        // Validate Product Name (only letters)
        if (!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(req.body.productname)) {
            isValid = false;
            errors.productname = "Product name should contain only letters.";
        }

        // Validate Price (only numbers)
        if (!/^\d+(\.\d+)?$/.test(req.body.price)) {
            isValid = false;
            errors.price = "Price should be a number.";
        }

        // Validate Description (letters and numbers, not just spaces)
        if (!/^[a-zA-Z\d\s\(\)\-\/,\.]*[a-zA-Z][a-zA-Z\d\s\(\)\-\/,\.]*$/.test(req.body.des) || !req.body.des.trim()) {
            isValid = false;
            errors.description = "Description should contain letters and numbers and cannot be just spaces.";
        }

        if (!isValid) {
            const categories = await category.find({}, 'id, name');
            res.render('addproduct', { categories, errors });
            return;
        }

        if (req.fileValidationError) {
            throw new Error(req.fileValidationError);
        }

        if (!req.files || req.files.length === 0) {
            errors.images = ["No images uploaded"];
            throw new Error("No images uploaded");
        }

        const image = req.files.map ( (files) => files.filename )
        const newProduct = new product ( {
            name : req.body.productname , 
            category : req.body.categoryId ,
            description : req.body.des ,
            price : req.body.price ,
            images : image
        }) 
        
        const productData = await newProduct.save()

        if(productData) {
            const categories = await category.find({} , 'id , name')
            res.render('addproduct' , { categories , errors: {} })
        } else {
            res.render('addproduct' , { message : "failed" , errors: {}})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const viewProduct = async ( req , res ) => {
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

        const productData = await product.find({ isDeleted : false ,
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }}
            ]
        }).populate('category')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const count = await product.find({
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }}
            ]
        }).populate('category')
        .countDocuments()

        res.render('viewproducts' , { 
            products : productData ,
            totalPages : Math.ceil(count/limit) ,
            currentPage : page
        })
    } catch (error) {
        console.log(error.message);
    }
}

const viewsingleProduct = async ( req , res ) => {
    try {
        const productData = await product.findById({_id:req.query.id}).populate('category')
        if(productData) {
            res.render('viewsingleproduct' , { products : productData })
        } else {
            res.redirect('/viewproducts')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editproductLoad = async ( req , res ) => {
    try {
       const id = req.query.id
       const productData = await product.findById({_id : id}).populate('category') 
       if(productData) {
            const categories = await category.find({} , 'id , name')
            res.render('editproduct' , { categories , product : productData , errors : {} })
       } else {
        res.redirect('/viewproducts')
       }
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async ( req , res ) => {
    try {
        // Validation logic
        let errors = {};
        let isValid = true;

        // Validate Product Name (only letters)
        if (!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(req.body.productname)) {
            isValid = false;
            errors.productname = "Product name should contain only letters.";
        }

        // Validate Price (only numbers)
        if (!/^\d+(\.\d+)?$/.test(req.body.price)) {
            isValid = false;
            errors.price = "Price should be a number.";
        }

        // Validate Description (letters and numbers, not just spaces)
        if (!/^[a-zA-Z\d\s\(\)\-\/,\.]*[a-zA-Z][a-zA-Z\d\s\(\)\-\/,\.]*$/.test(req.body.des) || !req.body.des.trim()) {
            isValid = false;
            errors.description = "Description should contain letters and numbers and cannot be just spaces.";
        }

        if (!isValid) {
            const categories = await category.find({}, 'id, name');
            const productData = await product.findById({_id : req.body.id}).populate('category')
            res.render('editproduct', { categories, product:productData , errors });
            return;
        }

        const image = req.files.map ( (files) => files.filename )
        const updateData = { 
            name : req.body.productname , 
            category : req.body.categoryId ,
            description : req.body.des ,
            price : req.body.price 
        }
        if(req.files){
            updateData.images = image
        }
        await product.findByIdAndUpdate (req.body.id , { $set : updateData})
        res.redirect('/viewproducts')
    } catch (error) {
        console.log(error.message);
    }
}

const softdeleteProduct = async (req , res) => {
    try {
        const { id } = req.query
        await product.findByIdAndUpdate ( id , { isDeleted : true })
        res.redirect('/viewproducts')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadaddProduct , 
    addProduct ,
    viewProduct ,
    viewsingleProduct , 
    editproductLoad ,
    updateProduct ,
    softdeleteProduct
}