const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const { serviceId, traderId, clientName, clientEmail, requestedDateTime, jobDescription } = req.body;

        const newBooking = new Booking({
            serviceId,
            traderId,
            clientName,
            clientEmail,
            requestedDateTime,
            jobDescription,
            status: 'pending'
        });

        await newBooking.save();
        res.status(201).json({ message: 'Booking created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating booking' });
    }
};

exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    
    const traderId = req.session.traderId;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

  

    booking.status = 'confirmed';
    await booking.save();

    res.json({ message: 'Booking accepted' });
  } catch (err) {
    console.error('acceptBooking error:', err);
    res.status(500).json({ message: 'Server error accepting booking' });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'rejected';
    await booking.save();

    res.json({ message: 'Booking rejected' });
  } catch (err) {
    console.error('rejectBooking error:', err);
    res.status(500).json({ message: 'Server error rejecting booking' });
  }
};

