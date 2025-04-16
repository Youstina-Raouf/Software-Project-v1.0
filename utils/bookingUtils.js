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
<<<<<<< HEAD
  };
=======
  };
  
>>>>>>> roba
