const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const sendEmail = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 2525,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2) Configure Handlebars plugin
    const handlebarOptions = {
        viewEngine: {
            extName: ".hbs",
            partialsDir: path.resolve('./src/views/email'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./src/views/email'),
        extName: ".hbs",
    };

    transporter.use('compile', hbs(handlebarOptions));

    // 3) Define the email options
    const mailOptions = {
        from: `Clothes Shop <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        template: options.template, // Tên file hbs (không cần đuôi .hbs)
        context: options.context   // Dữ liệu truyền vào template
    };

    // Fallback for old style calls (message/html)
    if (!options.template) {
        mailOptions.text = options.message;
        mailOptions.html = options.html;
    }

    console.log('Attempting to send email via Handlebars to:', options.email);

    // 4) Actually send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
