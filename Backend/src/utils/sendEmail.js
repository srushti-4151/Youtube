import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,    // from SMTP credentials
        pass: process.env.SMTP_PASSWORD // from SMTP credentials
    }
})

export default transporter;