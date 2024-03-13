const User = require ('../../models/userModel')
const bcrypt = require ('bcrypt')
const sendOTP = require('../../controllers/user/otpController')


const loadRegister = async (req , res) => {
    try {
        const { referralCode } = req.query
        req.session.referralCode = referralCode
        res.render ('signup' ,{ errors : {}})
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async(password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

function generateReferralCode ( length = 8 ) {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let referralCode = ''

    for ( let i = 0 ; i < length ; i++ ) {
        let randomIndex = Math.floor( Math.random() * characters.length )
        referralCode += characters.charAt ( randomIndex )
    }
    return referralCode
} 

const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)
        const name = req.body.name 
        const email = req.body.email  
        const mobile = req.body.mno  

        let errors = {}
        let isValid = true

        if (!/^[a-zA-Z\s]*[a-zA-Z][a-zA-Z\s]*$/.test(name)) {
            isValid = false;
            errors.name = "Name should contain only letters.";
        }

        if (!/^\d{10}$/.test(mobile)) {
            isValid = false;
            errors.mobile = "Please enter a valid 10-digit phone number.";
        }

        if (!/[^\s@]+@[^\s@]+\.[^\s@]+/gi.test(email)) {
            isValid = false;
            errors.email = "Email is not valid.";
        }

        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(req.body.password)) {
            isValid = false;
            errors.password = "Password must be greater than 5 and contain atleast one uppercase letter, one number";
        }

        if(req.body.password !== req.body.cpassword ) {
            isValid = false;
            errors.cpassword = "Passwords don't match"
        }

        if (!isValid) {
            res.render('signup', { errors });
            return;
        }

        // Check if the email is already in use
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            return res.render('signup', { message: 'Email already in use.' , errors : {} });
        }

        // Check if the mobile number is already in use
        const existingMobileUser = await User.findOne({ mobile });
        if (existingMobileUser) {
            return res.render('signup', { message: 'Mobile number already in use.' , errors : {} });
        }

        const referralCode = await generateReferralCode()
        
        const tempUser = { name , email , mobile , password : spassword , referralCode }
        
        req.session.tempUser = tempUser

        if (tempUser) {
            sendOTP.send( req , res )
            res.redirect ('/otp')
        }
        else{
            res.render ('signup', {message : "Your registration failed" , errors : {} })
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister ,
    securePassword ,
    insertUser
}