function calculateTotalPrice(ticketsBooked, eventPrice) {
    return ticketsBooked * eventPrice;
  }
  
  function validateTicketQuantity(ticketsBooked, availableTickets) {
    return ticketsBooked <= availableTickets;
  }
  
  function updateAvailableTickets(currentAvailable, ticketsBooked) {
    return currentAvailable - ticketsBooked;
  }
  
  function revertAvailableTickets(currentAvailable, ticketsBooked) {
    return currentAvailable + ticketsBooked;
  }
  
  module.exports = {
    calculateTotalPrice,
    validateTicketQuantity,
    updateAvailableTickets,
    revertAvailableTickets

  };

//bonus
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};
