const isLogin = async (req,res,next) => {
    try {
        if (req.session.admin_id){}
        else{
            res.redirect ('/adminlogin')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req,res,next) => {
    try {
        if(req.session.admin_id) {
            res.redirect ('/home')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin ,
    isLogout
}