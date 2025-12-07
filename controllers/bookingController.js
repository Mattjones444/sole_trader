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
