const nodemailer = require('nodemailer');

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP configuration missing. Using test account.');
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'test@example.com',
                pass: 'testpass'
            }
        });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@example.com',
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <h1>Password Reset Request</h1>
            <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
            <h2 style="color: #4CAF50; font-size: 24px; letter-spacing: 2px;">${otp}</h2>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', info.messageId);
        // For development, log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log('Development OTP:', otp);
        }
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        // For development, still return success and log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log('Development OTP (email failed):', otp);
            return true;
        }
        throw new Error('Failed to send OTP email');
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
}; 