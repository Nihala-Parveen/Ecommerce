const mongoose = require('mongoose')

const db = mongoose.connect(process.env.MONGO_URL)

db.then (() => { 
    console.log("db connected");
}).catch((error) => {
    console.log(error.message);
})