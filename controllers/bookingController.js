const Booking = require('../models/Booking');
const Trader = require('../models/Trader');
const Service = require('../models/Service');
const { sendTemplateMail } = require('../utils/mailer');

//Create a booking
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      traderId,
      clientName,
      clientEmail,
      location,
      requestedDateTime,
      jobDescription
    } = req.body;

    // Basic validation
    if (
      !serviceId ||
      !traderId ||
      !clientName ||
      !clientEmail ||
      !location ||
      !requestedDateTime ||
      !jobDescription
    ) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Fetch trader + service (for email)
    const [trader, service] = await Promise.all([
      Trader.findById(traderId).lean(),
      Service.findById(serviceId).lean()
    ]);

    if (!trader) return res.status(404).json({ error: 'Trader not found' });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const booking = new Booking({
      serviceId,
      traderId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      location: location.trim(),
      requestedDateTime,
      jobDescription: jobDescription.trim(),
      status: 'pending'
    });

    console.log('📧 Sending TEMPLATE email new-booking.ejs to:', trader.email);


    await booking.save();

    // Email trader
    (async () => {
      try {
        await sendTemplateMail({
          to: trader.email,
          subject: `New service request: ${service.title}`,
          template: 'booking/new-booking.ejs',
          data: {
            service,
            clientName,
            clientEmail,
            location,
            requestedDateTime: new Date(requestedDateTime).toLocaleString('en-GB'),
            jobDescription
          }
        });
      } catch (err) {
        console.error('Email to trader failed:', err);
      }
    })();

    return res.status(201).json({ message: 'Booking created successfully' });

  } catch (err) {
    console.error('createBooking error:', err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid booking data' });
    }

    return res.status(500).json({ error: 'Error creating booking' });
  }
};

//Accept booking
exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const traderId = req.session.traderId;

    if (!traderId) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const booking = await Booking.findOne({ _id: bookingId, traderId })
      .populate('serviceId')
      .populate('traderId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Email client
    (async () => {
      try {
        await sendTemplateMail({
          to: booking.clientEmail,
          subject: 'Your booking has been accepted',
          template: 'booking/booking-accepted.ejs',
          data: {
            traderName: booking.traderId.name,
            serviceTitle: booking.serviceId.title,
            requestedDateTime: booking.requestedDateTime
              ? new Date(booking.requestedDateTime).toLocaleString('en-GB')
              : ''
          }
        });
      } catch (err) {
        console.error('Email to client (accept) failed:', err);
      }
    })();

    return res.json({ message: 'Booking accepted' });

  } catch (err) {
    console.error('acceptBooking error:', err);
    return res.status(500).json({ message: 'Server error accepting booking' });
  }
};

//reject booking
exports.rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const traderId = req.session.traderId;

    if (!traderId) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const booking = await Booking.findOne({ _id: bookingId, traderId })
      .populate('serviceId')
      .populate('traderId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'rejected';
    await booking.save();

    // Email client
    (async () => {
      try {
        await sendTemplateMail({
          to: booking.clientEmail,
          subject: 'Your booking request was declined',
          template: 'booking/booking-rejected.ejs',
          data: {
            serviceTitle: booking.serviceId.title
          }
        });
      } catch (err) {
        console.error('Email to client (reject) failed:', err);
      }
    })();

    return res.json({ message: 'Booking rejected' });

  } catch (err) {
    console.error('rejectBooking error:', err);
    return res.status(500).json({ message: 'Server error rejecting booking' });
  }
};
