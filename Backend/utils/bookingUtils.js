const nodemailer = require("nodemailer");

function calculateTotalPrice(ticketsBooked, eventPrice) {
    return ticketsBooked * eventPrice;
  }
  
  function validateTicketQuantity(ticketsBooked, availableTickets) {
    return ticketsBooked <= availableTickets;
  }
  
  function updateAvailableTickets(currentAvailable, ticketsBooked) {
    return currentAvailable + ticketsBooked;
  }
  
  function revertAvailableTickets(currentAvailable, ticketsBooked) {
    return currentAvailable + ticketsBooked;
  }
  
  // Create reusable transporter object
  const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is missing. Please check your .env file.');
    }

    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  };

  const sendOTPEmail = async (to, otp) => {
    try {
      if (!to || !otp) {
        throw new Error('Email address and OTP are required');
      }

      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Your Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset OTP</h2>
            <p>Your OTP for password reset is:</p>
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">${otp}</h1>
            <p style="color: #666;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
          </div>
        `
      };

      console.log('Attempting to send email to:', to);
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  };

  module.exports = {
    calculateTotalPrice,
    validateTicketQuantity,
    updateAvailableTickets,
    revertAvailableTickets,
    sendOTPEmail
  };
