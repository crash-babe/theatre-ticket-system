const express = require('express');
const router = express.Router();
const Show = require('../models/Show');

// Get all shows
router.get('/', async (req, res) => {
  try {
    const shows = await Show.find().sort({ date: 1 });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single show by ID
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new show
router.post('/', async (req, res) => {
  const show = new Show({
    title: req.body.title,
    date: req.body.date,
    time: req.body.time,
    description: req.body.description,
    ticketPrice: req.body.ticketPrice,
    totalSeats: req.body.totalSeats,
    availableSeats: req.body.totalSeats,
    venue: req.body.venue
  });

  try {
    const newShow = await show.save();
    res.status(201).json(newShow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update show
router.put('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        show[key] = req.body[key];
      }
    });

    const updatedShow = await show.save();
    res.json(updatedShow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete show
router.delete('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    await show.deleteOne();
    res.json({ message: 'Show deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;