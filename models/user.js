const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    expireToken: Date,
    pic: {
        type: String,
        default: 'https://res.cloudinary.com/instaimagesparnab/image/upload/v1601044739/146-1461473_default-profile-picture-transparent_rx1wow.png'
    },
    pic_id: {
        type: String,
        default: 'default'
    },
    WhiteBoards: [{
        img: { type: String },
        img_id: { type: String },
        drawings: { type: Array }
    }],
})

mongoose.model("User", userSchema)
