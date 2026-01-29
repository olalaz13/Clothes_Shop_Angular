const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
    console.log('--- SMTP CONFIG ---');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('USER:', process.env.EMAIL_USER);
    console.log('PASS:', process.env.EMAIL_PASS ? '********' : 'MISSING');
    console.log('FROM:', process.env.EMAIL_FROM);
    console.log('-------------------');

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 2525,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: 'test@example.com', // Mailtrap catches everything anyway
            subject: 'Test Email from Clothes Shop',
            text: 'If you see this, SMTP is working correctly!',
            html: '<b>If you see this, SMTP is working correctly!</b>'
        });
        console.log('Success! Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('FAILED to send email:');
        console.error(error);
    }
};

testEmail();
