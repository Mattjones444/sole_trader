const Service = require('../models/Service');

exports.showAllServices = async (req, res) => {
    try {
        const filter = {};
        if (req.query.tradeType) {
            filter.tradeType = req.query.tradeType;
        }

        const services = await Service.find(filter).populate('traderId', 'name tradeType');

        res.render('services', { services });
    } catch (err) {
        console.error(err);
        res.send('Error loading services');
    }
};
