const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage( {
    destination : function(req,file,cb){
        cb(null,path.join(__dirname, '../public/uploads'))
    },
    filename : function(req,file,cb){
        cb(null,file.originalname)
    }
})

const fileFilter = ( req , file , cb ) => {
    const imgType = ["image/jpeg" , "image/png" , "image/jpg"]
    if(imgType.includes(file.mimetype)) {
        cb(null,true)
    } else {
        req.fileValidationError = "Only accept jpeg and png images"
        cb(new Error('Only accept jpeg and png images'),false)
    }
}

const upload = multer ( {
    storage : storage ,
    fileFilter : fileFilter
})

module.exports = upload