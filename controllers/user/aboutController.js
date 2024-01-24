const loadAbout = async ( req , res ) => {
    try {
        res.render ('about')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadAbout
}