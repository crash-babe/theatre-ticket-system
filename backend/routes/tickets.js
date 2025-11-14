const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Show = require('../models/Show');
const Customer = require('../models/Customer');

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('show')
      .populate('customer')
      .sort({ bookingDate: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('show')
      .populate('customer');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tickets by show ID
router.get('/show/:showId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ show: req.params.showId })
      .populate('customer');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new ticket (book seats)
router.post('/', async (req, res) => {
  try {
    // Check if show exists and has available seats
    const show = await Show.findById(req.body.show);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    if (show.availableSeats < req.body.numberOfTickets) {
      return res.status(400).json({ 
        message: 'Not enough seats available',
        availableSeats: show.availableSeats 
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Calculate total price
    const totalPrice = show.ticketPrice * req.body.numberOfTickets;

    // Create ticket
    const ticket = new Ticket({
      show: req.body.show,
      customer: req.body.customer,
      seatNumbers: req.body.seatNumbers,
      numberOfTickets: req.body.numberOfTickets,
      totalPrice: totalPrice,
      status: req.body.status || 'reserved',
      paymentStatus: req.body.paymentStatus || 'pending'
    });

    const newTicket = await ticket.save();

    // Update available seats
    show.availableSeats -= req.body.numberOfTickets;
    await show.save();

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('show')
      .populate('customer');

    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ticket status
router.put('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        ticket[key] = req.body[key];
      }
    });

    const updatedTicket = await ticket.save();
    const populatedTicket = await Ticket.findById(updatedTicket._id)
      .populate('show')
      .populate('customer');
    
    res.json(populatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Return seats to show
    const show = await Show.findById(ticket.show);
    if (show) {
      show.availableSeats += ticket.numberOfTickets;
      await show.save();
    }

    await ticket.deleteOne();
    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;