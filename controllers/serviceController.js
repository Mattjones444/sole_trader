const Service = require('../models/Service');

exports.showAllServices = async (req, res) => {
  try {
    // NOTE: filter.tradeType only works if Service schema has tradeType.
    // If you meant trader's tradeType, see section #2 below.
    const filter = {};
    if (req.query.tradeType) {
      filter.tradeType = req.query.tradeType;
    }

    const servicesRaw = await Service.find(filter)
      .populate('traderId', 'name tradeType')
      .lean();

    // Remove services where trader no longer exists / traderId couldn't be populated
    const services = servicesRaw.filter(s => s.traderId);

    res.render('services', { services });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading services');
  }
};

exports.createService = async (req, res) => {
  try {
    const traderId = req.session.traderId;

    const { title, description, pricingType, basePrice, category } = req.body;

    if (!title || !description || !pricingType || basePrice === undefined || !category) {
      return res.status(400).send('All fields are required.');
    }

    if (!['hourly', 'fixed'].includes(pricingType)) {
      return res.status(400).send('Invalid pricing type.');
    }

    const numericPrice = Number(basePrice);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).send('Base price must be a valid number.');
    }

    const service = await Service.create({
      traderId,
      title: title.trim(),
      description: description.trim(),
      pricingType,
      basePrice: numericPrice,
      category: category.trim()
    });

    return res.status(201).json({ message: 'Service created', serviceId: service._id });
  } catch (err) {
    console.error('createService error:', err);
    return res.status(500).send('Server error creating service.');
  }
};

// Update a service (only owner)
exports.updateService = async (req, res) => {
  try {
    const traderId = req.session.traderId;
    const serviceId = req.params.id;

    const { title, description, category, pricingType, basePrice } = req.body;

    if (!title || !description || !category || !pricingType || basePrice === undefined) {
      return res.status(400).send('All fields are required.');
    }

    if (!['hourly', 'fixed'].includes(pricingType)) {
      return res.status(400).send('Invalid pricing type.');
    }

    const numericPrice = Number(basePrice);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).send('Base price must be a valid number.');
    }

    const service = await Service.findOne({ _id: serviceId, traderId });
    if (!service) return res.status(403).send('Not allowed.');

    service.title = title.trim();
    service.description = description.trim();
    service.category = category.trim();
    service.pricingType = pricingType;
    service.basePrice = numericPrice;

    await service.save();

    return res.status(200).send('Service updated');
  } catch (err) {
    console.error('updateService error:', err);
    return res.status(500).send('Server error updating service.');
  }
};

// Delete a service (only owner)
exports.deleteService = async (req, res) => {
  try {
    const traderId = req.session.traderId;
    const serviceId = req.params.id;

    const deleted = await Service.findOneAndDelete({ _id: serviceId, traderId });
    if (!deleted) return res.status(403).send('Not allowed.');

    return res.status(200).send('Service deleted');
  } catch (err) {
    console.error('deleteService error:', err);
    return res.status(500).send('Server error deleting service.');
  }
};
