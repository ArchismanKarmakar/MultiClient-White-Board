module.exports = {
    MongoURI: process.env.MongoURI,
    JWT_SECRET: process.env.JWT_SEC,
    EMAIL: {
        USER: process.env.USER,
        PASS: process.env.PASS,
        URL: process.env.URL,
    },
    CLOUDINARY: {
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: process.env.CLOUDINARY_API_KEY,
        API_SECRET: process.env.CLOUDINARY_API_SECRET,
        UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET
    }
}