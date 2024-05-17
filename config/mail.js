const {createTransport} =require("nodemailer");
require("dotenv").config()

module.exports = createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth:{
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
    },
}) 
