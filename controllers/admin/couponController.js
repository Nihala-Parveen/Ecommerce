const Coupon = require ('../../models/couponModel')

const getAddCoupon = async ( req , res ) => {
    try {
       res.render('addCoupon' , { errors : {} }) 
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async ( req , res ) => {
    try {
        const { code , des , discount , amount , date } = req.body

        const existingCoupon = await Coupon.findOne({ couponCode: code })

        const expiryDate = new Date(date)
        const currDate = new Date()

        let errors = {}
        let isValid = true

        if(existingCoupon){
            isValid = false
            errors.code = "Coupon already in use."
        }

        if(!/^[a-zA-Z\d\s]*[a-zA-Z\d][a-zA-Z\d\s]*$/.test(code)){
            isValid = false
            errors.code = "Coupon code should only contain letters and digits."
        }

        if(!/^[a-zA-Z\d\s\(\)\-\/,\.]*[a-zA-Z][a-zA-Z\d\s\(\)\-\/,\.]*$/.test(des)){
            isValid = false;
            errors.description = "Description should contain letters and numbers and cannot be just spaces.";
        }  

        if (!/^\d+(\.\d+)?$/.test(discount)) {
            isValid = false;
            errors.dis = "Discount amount should be a number.";
        }

        if (!/^\d+(\.\d+)?$/.test(amount)) {
            isValid = false;
            errors.min = "Minimum amount should be a number.";
        }

        if(expiryDate.getTime() < currDate.getTime() ) {
            isValid = false;
            errors.date = "Date should be greater than today.";
        }

        if(!isValid){
            res.render('addCoupon' , {errors})
            return
        }
        const upCode = code.toUpperCase()
        const coupon = new Coupon ({
            couponCode : upCode ,
            description : des , 
            discountAmount : discount ,
            minAmount : amount ,
            expiryDate : date
        })
        await coupon.save()
        res.redirect('/coupons')
    } catch (error) {
        console.log(error.message);
    }
}

const viewCoupon = async ( req , res ) => {
    try {
        var page = 1
        if(req.query.page){
            page = parseInt(req.query.page , 10 )
        }

        const limit = 3

        const  couponData = await Coupon.find({})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const  count = await Coupon.find({}).countDocuments()

        res.render('viewCoupon' , { 
            coupons : couponData , 
            totalPages : Math.ceil(count/limit) ,
            currentPage : page
        } )
    } catch (error) {
        console.log(error.message);
    }
}

const getEditCoupon = async ( req , res ) => {
    try {
       const { id } = req.query
       const couponData = await Coupon.findById({ _id : id})
       res.render('editCoupon' , { couponData , errors : {} }) 
    } catch (error) {
        console.log(error.message);
    }
}

const updateCoupon = async ( req , res ) => {
    try {
        const { id , code , des , discount , amount , date } = req.body

        const expiryDate = new Date(date)
        const currDate = new Date()

        let errors = {}
        let isValid = true

        if(!/^[a-zA-Z\d\s]*[a-zA-Z\d][a-zA-Z\d\s]*$/.test(code)){
            isValid = false
            errors.code = "Coupon code should only contain letters and digits."
        }

        if(!/^[a-zA-Z\d\s\(\)\-\/,\.]*[a-zA-Z][a-zA-Z\d\s\(\)\-\/,\.]*$/.test(des)){
            isValid = false;
            errors.description = "Description should contain letters and numbers and cannot be just spaces.";
        }  

        if (!/^\d+(\.\d+)?$/.test(discount)) {
            isValid = false;
            errors.dis = "Discount amount should be a number.";
        }

        if (!/^\d+(\.\d+)?$/.test(amount)) {
            isValid = false;
            errors.min = "Minimum amount should be a number.";
        }

        if(expiryDate.getTime() < currDate.getTime() ) {
            isValid = false;
            errors.date = "Date should be greater than today.";
        }

        if(!isValid){
            const couponData = await Coupon.findById({ _id : id})
            res.render('editCoupon' , { couponData , errors})
            return
        }
        const upCode = code.toUpperCase()
        const updateData = {
            couponCode : upCode ,
            description : des , 
            discountAmount : discount ,
            minAmount : amount ,
            expiryDate : date
        }
        
        await Coupon.findByIdAndUpdate( id , { $set : updateData })
        res.redirect('/coupons')
    } catch (error) {
        console.log(error.message);
    }
}


const deleteCoupon = async (req , res) => {
    try {
        const id = req.query.id
        await Coupon.deleteOne({_id:id})
        res.redirect('/coupons')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getAddCoupon ,
    addCoupon ,
    viewCoupon ,
    getEditCoupon ,
    updateCoupon ,
    deleteCoupon
}