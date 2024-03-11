const express = require ('express')
const app = express()

require('dotenv').config()

require('./config/config')

app.set ('view engine','ejs')
app.use ( express.json() )
app.use ( express.urlencoded ( { extended : true } ) )
app.use ( express.static ( __dirname + '/public') )
app.use ( express.static ( __dirname + '/node_modules/cropperjs'))

//home page route
const home = require ('./routes/user/home')
app.use('/', home)

//user login route
const login = require ('./routes/user/login')
app.use('/', login)

//user signup route
const signup = require ('./routes/user/signup')
app.use('/', signup)

//otp route
const otp = require ('./routes/user/otp')
app.use('/', otp)

//user account route
const account = require ('./routes/user/account')
app.use('/', account)

//admin home route
const admin = require ('./routes/admin/home')
app.use('/', admin)

//adminsignup route
const adminsignup = require ('./routes/admin/signup')
app.use('/', adminsignup)

//adminlogin route
const adminlogin = require ('./routes/admin/login')
app.use('/', adminlogin)

//category route
const category = require('./routes/admin/category')
app.use('/' , category)

//product route
const product = require('./routes/admin/product')
app.use('/' , product)

//user route
const user = require('./routes/admin/user')
app.use('/' , user )

//user product page
const userpage = require ('./routes/user/product')
app.use('/' , userpage )

//cart route
const cart = require('./routes/user/cart')
app.use('/' , cart)

//order route
const order = require('./routes/user/order')
app.use('/' , order )

//admin order route
const adminOrder = require('./routes/admin/order')
app.use('/' , adminOrder )

//admin coupon route
const adminCoupon = require('./routes/admin/coupon')
app.use('/', adminCoupon )

app.listen (3000 , () => console.log("Server started at port 3000"))