const User = require("../../models/userModel")

const viewUsers = async ( req , res ) => {
    try {
        var search = ''
        if(req.query.search){
            search = req.query.search
        }

        var page = 1
        if(req.query.page){
            page = parseInt(req.query.page , 10 )
        }

        const limit = 3

        const usersData = await User.find({
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }} ,
                { email : { $regex : '.*'+search+'.*' }} ,
                { mobile : { $regex : '.*'+search+'.*' }} 
            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

        const count = await User.find({
            $or : [
                { name : { $regex : '.*'+search+'.*' , $options : 'i' }} ,
                { email : { $regex : '.*'+search+'.*' }} ,
                { mobile : { $regex : '.*'+search+'.*' }} 
            ]
        }).countDocuments()

        res.render('viewusers' , { 
            users : usersData , 
            totalPages : Math.ceil(count/limit) ,
            currentPage : page
        })

    } catch (error) {
        console.log(error.message);
    }
}

const toggleblockUser = async ( req , res ) => {
    try {
        const { id } = req.query
        const user = await User.findById(id)
        const userblock = user.isBlocked ? false : true
        await User.findByIdAndUpdate(id , {isBlocked : userblock})
        res.redirect('/viewusers')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    viewUsers ,
    toggleblockUser 
}