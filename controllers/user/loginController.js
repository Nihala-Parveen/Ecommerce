const User = require('../../models/userModel')
const bcrypt = require('bcrypt')

const loginLoad = async (req , res) => {
    try {
        res.render ('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const userData = await User.findOne({email:email})
        if(userData){
            if(userData.isBlocked){
                return res.render('login' , { message : "Your account has been blocked by admin"})
            }
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch) {
                req.session.user_id = userData._id
                res.redirect('/home')
            }
            else {
                res.render('login',{message:"Email or password incorrect"})
            }
        }
        else{
            res.render('login',{message:"Email or password incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logOut = async (req,res) => {
    try {
        req.session.destroy()
        res.redirect ('/')
    } catch (error) {
        console.log (error.message)
    }
}

module.exports = {
    loginLoad , 
    verifyLogin ,
    logOut
}