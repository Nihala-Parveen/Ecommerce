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

const updateQuantity = async (req, res) => {
    try {
        const { id, action } = req.body
        const product = await Product.findById(id)
        const cart = await Cart.findOne({ 'products.productId': id });
        let productError = []
        if (cart) {
            const productIndex = cart.products.findIndex((product) => product.productId.toString() === id);

            if (action === 'increase') {
                if (product.stock > cart.products[productIndex].quantity) {
                    await increaseQuantity(id)
                }
                else {
                    const userId = req.session.user_id
                    const cartData = await Cart.findOne({ userId }).populate('products.productId')
                    productError.push({ id: productIndex, message: "Maximum stock reached" });
                    return res.render('cart', { carts: cartData, productError })
                }
            }
        }
        if (action === 'decrease') {
            await decreaseQuantity(id)
        }
        res.sendStatus(200);
    } catch (error) {
        console.log(error.message);
    }
}

const viewcart = async ( req , res ) => {
    try {
        const userId = req.session.user_id
        const cartData = await Cart.findOne({ userId }).populate('products.productId')
        const productError = []
        res.render('cart' , { carts : cartData , productError })
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
        let errorMessages = []
        res.render('checkout' , { users : userData , carts : cartData , errorMessages })
    } catch (error) {
       console.log(error.message); 
    }
}

const viewWishlist = async ( req , res ) => {
    try {
        const userId = req.session.user_id
        const wishlistData = await User.findOne({ _id : userId }).populate('wishlist.products')
        res.render('wishlist' , { wishlistData })
    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async ( req , res ) => {
    try {
        const { productId } = req.body
        const userId = req.session.user_id; 
        const existingProduct = await User.findOne({ _id : userId , "wishlist.products" : productId })
        if(existingProduct){
            res.json({success : false })
        } else {
            await User.findOneAndUpdate ( { _id : userId } , { $push : { wishlist : { products : productId }}})
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const removeWishlist = async ( req , res ) => {
    try {
        const userId = req.session.user_id; 
        const { productId } = req.query
        await User.findByIdAndUpdate(userId , { $pull : { wishlist : { products : productId }}})
        res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    addtoCart , 
    viewcart ,
    removecart , 
    loadCheckout ,
    updateQuantity , 
    viewWishlist ,
    addToWishlist ,
    removeWishlist
}