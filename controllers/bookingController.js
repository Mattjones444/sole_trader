const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      traderId,
      clientName,
      clientEmail,
      location, // NEW
      requestedDateTime,
      jobDescription
    } = req.body;

    // Basic validation (keeps errors clean)
    if (!serviceId || !traderId || !clientName || !clientEmail || !location || !requestedDateTime || !jobDescription) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newBooking = new Booking({
      serviceId,
      traderId,
      clientName: String(clientName).trim(),
      clientEmail: String(clientEmail).trim().toLowerCase(),
      location: String(location).trim(), // NEW
      requestedDateTime,                 // mongoose will cast to Date
      jobDescription: String(jobDescription).trim(),
      status: 'pending'
    });

    await newBooking.save();
    return res.status(201).json({ message: 'Booking created successfully' });
  } catch (err) {
    console.error('createBooking error:', err);

    // If it's a mongoose validation error, return 400 instead of 500
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid booking data', details: err.message });
    }

    return res.status(500).json({ error: 'Error creating booking' });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const traderId = req.session.traderId;

    if (!traderId) return res.status(401).json({ message: 'Not logged in' });

    // Only allow the booking's trader to accept it
    const booking = await Booking.findOne({ _id: bookingId, traderId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'confirmed';
    await booking.save();

    return res.json({ message: 'Booking accepted' });
  } catch (err) {
    console.error('acceptBooking error:', err);
    return res.status(500).json({ message: 'Server error accepting booking' });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const traderId = req.session.traderId;

    if (!traderId) return res.status(401).json({ message: 'Not logged in' });

    // Only allow the booking's trader to reject it
    const booking = await Booking.findOne({ _id: bookingId, traderId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'rejected';
    await booking.save();

    return res.json({ message: 'Booking rejected' });
  } catch (err) {
    console.error('rejectBooking error:', err);
    return res.status(500).json({ message: 'Server error rejecting booking' });
  }
};
