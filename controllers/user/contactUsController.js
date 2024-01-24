const loadContactUs = async ( req , res ) => {
    try {
        res.render ('contactUs')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadContactUs
}