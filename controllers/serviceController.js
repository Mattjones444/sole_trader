const Service = require('../models/Service');

exports.showAllServices = async (req, res) => {
  try {
    const filter = {};

    if (req.query.tradeType) {
      filter.tradeType = req.query.tradeType;
    }

    const servicesRaw = await Service.find(filter)
      .populate('traderId', 'name tradeType')
      .lean();

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

    if (!traderId) {
      return res.status(401).json({ message: 'Not logged in.' });
    }

    const { title, description, pricingType, basePrice, category } = req.body;

    if (!title || !description || !pricingType || basePrice === undefined || !category) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!['hourly', 'fixed'].includes(pricingType)) {
      return res.status(400).json({ message: 'Invalid pricing type.' });
    }

    const allowedCategories = [
      'Plumbing',
      'Electrical',
      'Cleaning',
      'Carpentry',
      'Gardening',
      'Painting'
    ];

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    if (!allowedCategories.includes(cleanCategory)) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    if (cleanTitle.length > 100) {
      return res.status(400).json({ message: 'Title is too long.' });
    }

    if (cleanDescription.length > 1000) {
      return res.status(400).json({ message: 'Description is too long.' });
    }

    if (cleanCategory.length > 50) {
      return res.status(400).json({ message: 'Category is too long.' });
    }

    const numericPrice = Number(basePrice);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: 'Base price must be a valid number.' });
    }

    const service = await Service.create({
      traderId,
      title: cleanTitle,
      description: cleanDescription,
      pricingType,
      basePrice: numericPrice,
      category: cleanCategory
    });

    return res.status(201).json({
      message: 'Service created',
      serviceId: service._id
    });
  } catch (err) {
    console.error('createService error:', err);
    return res.status(500).json({ message: 'Server error creating service.' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const traderId = req.session.traderId;
    const serviceId = req.params.id;

    if (!traderId) {
      return res.status(401).json({ message: 'Not logged in.' });
    }

    const { title, description, category, pricingType, basePrice } = req.body;

    if (!title || !description || !category || !pricingType || basePrice === undefined) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!['hourly', 'fixed'].includes(pricingType)) {
      return res.status(400).json({ message: 'Invalid pricing type.' });
    }

    const allowedCategories = [
      'Plumbing',
      'Electrical',
      'Cleaning',
      'Carpentry',
      'Gardening',
      'Painting'
    ];

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    if (!allowedCategories.includes(cleanCategory)) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    if (cleanTitle.length > 100) {
      return res.status(400).json({ message: 'Title is too long.' });
    }

    if (cleanDescription.length > 1000) {
      return res.status(400).json({ message: 'Description is too long.' });
    }

    if (cleanCategory.length > 50) {
      return res.status(400).json({ message: 'Category is too long.' });
    }

    const numericPrice = Number(basePrice);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: 'Base price must be a valid number.' });
    }

    const service = await Service.findOne({ _id: serviceId, traderId });
    if (!service) {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    service.title = cleanTitle;
    service.description = cleanDescription;
    service.category = cleanCategory;
    service.pricingType = pricingType;
    service.basePrice = numericPrice;

    await service.save();

    return res.status(200).json({ message: 'Service updated' });
  } catch (err) {
    console.error('updateService error:', err);
    return res.status(500).json({ message: 'Server error updating service.' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const traderId = req.session.traderId;
    const serviceId = req.params.id;

    if (!traderId) {
      return res.status(401).json({ message: 'Not logged in.' });
    }

    const deleted = await Service.findOneAndDelete({ _id: serviceId, traderId });

    if (!deleted) {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    return res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    console.error('deleteService error:', err);
    return res.status(500).json({ message: 'Server error deleting service.' });
  }
};