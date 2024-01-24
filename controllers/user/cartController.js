const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Cart = require('../../models/cartModel')

const addtoCart = async ( req , res ) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user_id; 

        let [ product , cart ] = await Promise.all ([ Product.findById(productId) , Cart.findOne({ userId }) ])

        // If cart doesn't exist, create a new one
        if (!cart) {
            cart = new Cart({ 
                userId, 
                products: [{ productId, quantity: 1 , price : product.price }]  
            });
        await cart.save()
        } else {
            // Check if product already exists in cart
            const productIndex = cart.products.findIndex(item => item.productId.equals(productId));

            if (productIndex > -1) {
                // Product exists, increase quantity
                cart.products[productIndex].quantity += 1;
                await cart.save()
            } else {
                // Product does not exist, add to cart
                cart.products.push({ productId, quantity: 1 , price : product.price });
                await cart.save()
            }
        }
        res.redirect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}

const increaseQuantity = async (productId) => {
    try {
       const cart = await Cart.findOne({'products.productId' : productId}) 
       if(cart) {
            const productIndex = cart.products.findIndex((product) => product.productId.toString() === productId )
            cart.products[productIndex].quantity += 1
            await cart.save()
       }   
    } catch (error) {
        console.log(error.message);
    }
}

const decreaseQuantity = async (productId) => {
    try {
        const cart = await Cart.findOne({'products.productId' : productId })
        if(cart) {
            const productIndex = cart.products.findIndex((product) => product.productId.toString() === productId)
            if(cart.products[productIndex].quantity > 1 ){
                cart.products[productIndex].quantity -= 1
                await cart.save()
            }
        } 
    } catch (error) {
        console.log(error.message);
    }
}

const updateQuantity = async ( req , res ) => {
    try {
        const { id , action } = req.body
        if(action === 'increase'){
            await increaseQuantity(id)
        }
        if(action === 'decrease') {
            await decreaseQuantity(id)
        }
        res.redirect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}

const viewcart = async ( req , res ) => {
    try {
        const userId = req.session.user_id
        const cartData = await Cart.findOne({ userId }).populate('products.productId')
        res.render('cart' , { carts : cartData })
    } catch (error) {
        console.log(error.message);
    }
}

const removecart = async ( req , res ) => {
    try {
        const { id , productId } = req.query
        await Cart.findOneAndUpdate( {_id : id} , { $pull : { products : { productId : productId }}} , { new : true }).populate('products.productId') 
        res.redirect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckout = async ( req , res ) => {
    try {
        const userId = req.session.user_id
        const [ userData , cartData ] = await Promise.all ( [ User.findById({_id:userId}) , Cart.findOne({userId}).populate('products.productId')])
        res.render('checkout' , { users : userData , carts : cartData })
    } catch (error) {
       console.log(error.message); 
    }
}

module.exports = {
    addtoCart , 
    viewcart ,
    removecart , 
    loadCheckout ,
    updateQuantity
}