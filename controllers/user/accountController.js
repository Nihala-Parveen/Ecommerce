const User = require("../../models/userModel")
const bcrypt = require('bcrypt')

const loadProfile = async (req,res) => {
    try {
        const userData = await User.findById({ _id : req.session.user_id })
        res.render('profile', { users : userData})
    } catch(error) {
        console.log(error.message);
    }
}

const editprofileLoad = async ( req , res ) => {
    try {
        const id = req.query.id.trim()
        const userData = await User.findById({_id:id})
        if(userData){
            res.render('editprofile' , { users : userData})
        } else {
            res.redirect('/profile')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req,res) => {
    try {
        const id = req.body.id.trim()
        const userData = await User.findByIdAndUpdate( id , {$set : {name : req.body.name , email : req.body.email, mobile : req.body.mno}})
        res.redirect ('/profile')
    } catch (error) {
        console.log(error.message);
    }
}

const changePasswordLoad = async (req , res) => {
    try {
        res.render ('changepassword')
    } catch (error) {
        console.log(error.message);
    }
}

const changePassword = async ( req , res ) => {
    try {
       const { oldPassword , newPassword , confirmNewPassword } = req.body
       const userId = req.session.user_id  

       if( newPassword !== confirmNewPassword ) {
            res.render('changepassword' , { message : 'New passwords do not match '})
            return
       }

       const passwordRegex =  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
       if(!passwordRegex.test(newPassword)){
            res.render('changepassword' , { message : 'Password must be greater than 5 characters and contain atleast 1 uppercase letter and 1 number.'})
            return
       }

       const user = await User.findById(userId)

       if(!user || !bcrypt.compareSync(oldPassword , user.password)){
            res.render('changepassword' , {message:'Invalid old password.'})
       }

       const hashedPassword = await bcrypt.hash(newPassword,10)
       await User.findByIdAndUpdate(userId , { password : hashedPassword } , { new : true })
       res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}

const getAddresses = async ( req , res ) => {
    try {
        const userData = await User.findById({ _id : req.session.user_id})
        res.render('addresses' , { users:userData})
    } catch (error) {
        console.log(error.message);
    }
}
 
const addAddressLoad = async ( req , res ) => {
    try {
        res.render('addAddress' , { errors: {} }) 
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async ( req , res ) => {
    try {
        let errors = {};
        let isValid = true;

        if (!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(req.body.buildingName)) {
            isValid = false;
            errors.buildingName = "Building name should contain only letters.";
        }

        if (!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(req.body.city)) {
            isValid = false;
            errors.city = "City should contain only letters.";
        }

        if (!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(req.body.district)) {
            isValid = false;
            errors.district = "District should contain only letters.";
        }

        if(!/^\d{6}$/.test(req.body.ZIPcode)) {
            isValid = false
            errors.ZIPcode = "ZIPCode should only contain numbers."
        }

        if(!isValid){
            res.render('addAddress' , { errors })
            return
        }

        const userId = req.session.user_id
        const newAdress = {
            buildingName : req.body.buildingName ,
            city : req.body.city ,
            district : req.body.district , 
            ZIPcode : req.body.ZIPcode
        }
        await User.findByIdAndUpdate(userId , { $push : { address : newAdress }} , { new : true })
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadProfile , 
    editprofileLoad ,
    updateProfile ,
    changePasswordLoad ,
    changePassword , 
    getAddresses ,
    addAddressLoad ,
    addAddress
}