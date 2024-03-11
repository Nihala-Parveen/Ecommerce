const User = require ("../../models/userModel")
const nodemailer = require('nodemailer')
const randomString = require ('randomstring')

const loadOtp = async ( req , res ) => {
    try {
        res.render ('otp')
    } catch (error) {
        console.log(error.message);
    }
}

const transporter = nodemailer.createTransport ( {
    host : 'smtp.gmail.com' ,
    port: 587,
    secure: false ,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

const send = async (req , res) => {
    const otp = randomString.generate( { length : 6 , charset : 'numeric'})
    const expires = new Date().getTime() + 120000
    
    req.session.otpData = { otp , expires }
    console.log(otp);
    const mailOptions = {
        from: process.env.SMTP_USER , // sender address
        to: req.body.email ,
        subject: "OTP Verification", // Subject line
        html: `<b>OTP for registration is ${otp}</b>`, // html body

    }
    try {
        await transporter.sendMail ( mailOptions )
    } catch (error) {
        console.log(error.message);
    }
}

const verify = async (req , res) => {
    let currenttime = new Date().getTime()
    const sessionOtpData = req.session.otpData
    if (sessionOtpData && req.body.otp === sessionOtpData.otp && currenttime < sessionOtpData.expires ) {
        const tempUser = req.session.tempUser
        const user = new User(tempUser)
        await user.save()
        req.session.tempUser = null
        req.session.user_id = user._id
        if (req.session.referralCode) {
            await Promise.all([await User.findOneAndUpdate(
                { referralCode: req.session.referralCode },
                { $inc: { wallet: 500 } },
                { new: true }
            ),
            User.findByIdAndUpdate(
                { _id: req.session.user_id },
                { $inc: { wallet: 500 } },
                { new: true }
            )]) 
            res.redirect ('/home')
        } else {
            res.redirect ('/home')
        }
    }
    else {
        res.render('otp' , {message : "OTP is incorrect or expired."})
    }
}

module.exports = {
    loadOtp ,
    send ,
    verify
}