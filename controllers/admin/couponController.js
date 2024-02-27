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
        const  couponData = await Coupon.find({})
        res.render('viewCoupon' , { coupons : couponData } )
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
    deleteCoupon
}