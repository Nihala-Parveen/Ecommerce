const Admin = require('../../models/adminModel')
const bcrypt = require('bcrypt')
const { check , validationResult } = require('express-validator')

const loadRegister = async (req , res) => {
    try {
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
    check('email').isEmail().withMessage('Email is not valid').normalizeEmail(),
    check('password').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).withMessage('Password must be greater than 5 and contain atleast one uppercase letter, one number'),
    check('cpassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            }
            return true;
        }),
  ];

  const insertAdmin = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty() ) {
        const alert = errors.array()
        return res.render ('signup', { alert } )
    }
    try {
        const spassword = await securePassword(req.body.password)
        const email = req.body.email  

        // Check if the email is already in use
        const existingEmailAdmin = await Admin.findOne({ email });
        if (existingEmailAdmin) {
            return res.render('signup', { message: 'Email already in use.' });
        }

        const admin = new Admin({ 
           email , 
           password : spassword , 
        })
        const adminData = await admin.save()

        if (adminData) {
            res.render ('home')
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
    validateSignup ,
    insertAdmin
}