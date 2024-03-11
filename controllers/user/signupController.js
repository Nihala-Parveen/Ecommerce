const User = require ('../../models/userModel')
const bcrypt = require ('bcrypt')
const { check, validationResult } = require('express-validator');
const sendOTP = require('../../controllers/user/otpController')


const loadRegister = async (req , res) => {
    try {
        const { referralCode } = req.query
        req.session.referralCode = referralCode
        res.render ('signup')
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

const validateSignup = [
    check('name').matches(/^[a-zA-Z\s]+$/).withMessage('Name should only contain letters'),
    check('email').isEmail().withMessage('Email is not valid').normalizeEmail(),
    check('mno').isMobilePhone().withMessage('Mobile number is not valid'),
    check('password').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).withMessage('Password must be greater than 5 and contain atleast one uppercase letter, one number'),
    check('cpassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            }
            return true;
        }),
  ];

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
    const errors = validationResult(req)
    if (!errors.isEmpty() ) {
        const alert = errors.array()
        return res.render ('signup', { alert } )
    }
    try {
        const spassword = await securePassword(req.body.password)
        const name = req.body.name 
        const email = req.body.email  
        const mobile = req.body.mno  

        // Check if the email is already in use
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            return res.render('signup', { message: 'Email already in use.' });
        }

        // Check if the mobile number is already in use
        const existingMobileUser = await User.findOne({ mobile });
        if (existingMobileUser) {
            return res.render('signup', { message: 'Mobile number already in use.' });
        }

        const referralCode = await generateReferralCode()
        
        const tempUser = { name , email , mobile , password : spassword , referralCode }
        
        req.session.tempUser = tempUser

        if (tempUser) {
            sendOTP.send( req , res )
            res.redirect ('/otp')
        }
        else{
            res.render ('signup', {message : "Your registration failed"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister ,
    securePassword ,
    validateSignup ,
    insertUser
}