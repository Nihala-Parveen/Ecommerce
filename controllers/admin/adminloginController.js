const Admin = require ("../../models/adminModel")
const bcrypt = require("bcrypt")

const loginLoad = async (req , res) => {
    try {
        res.render ('adminlogin')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const adminData = await Admin.findOne({email:email})
        if(adminData){
            const passwordMatch = await bcrypt.compare(password,adminData.password)
            if(passwordMatch) {
                req.session.admin_id = adminData._id
                res.redirect('/admin')
            }
            else {
                res.render('adminlogin',{message:"Email or password incorrect"})
            }
        }
        else{
            res.render('adminlogin',{message:"Email or password incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logOut = async (req,res) => {
    try {
        req.session.destroy()
        res.redirect ('/adminlogin')
    } catch (error) {
        console.log (error.message)
    }
}

module.exports = {
    loginLoad ,
    verifyLogin , 
    logOut
}