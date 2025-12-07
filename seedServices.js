require('dotenv').config();

const mongoose = require('mongoose');
const Service = require('./models/Service'); // adjust path if needed

// Trader IDs
const trader1Id = '693308506b67050f0328986b';
const trader2Id = '69330fe84ea2b032fdb6bd1c';

// Sample services (10 in total) with pricingType and category
const services = [
  { title: 'Plumbing - Leak Fix', description: 'Fix leaking pipes and faucets.', basePrice: 50, pricingType: 'fixed', category: 'Plumbing', traderId: trader1Id },
  { title: 'Electrical - Light Installation', description: 'Install new lighting fixtures safely.', basePrice: 70, pricingType: 'fixed', category: 'Electrical', traderId: trader1Id },
  { title: 'Gardening - Lawn Mowing', description: 'Mow and trim your lawn.', basePrice: 40, pricingType: 'fixed', category: 'Gardening', traderId: trader1Id },
  { title: 'Painting - Interior Walls', description: 'Professional interior wall painting.', basePrice: 100, pricingType: 'fixed', category: 'Painting', traderId: trader1Id },
  { title: 'Carpentry - Furniture Assembly', description: 'Assemble furniture quickly and safely.', basePrice: 60, pricingType: 'fixed', category: 'Carpentry', traderId: trader1Id },
  
  { title: 'Gardening - Hedge Trimming', description: 'Trim and shape your hedges.', basePrice: 45, pricingType: 'fixed', category: 'Gardening', traderId: trader2Id },
  { title: 'Electrical - Outlet Repair', description: 'Repair and replace faulty outlets.', basePrice: 55, pricingType: 'fixed', category: 'Electrical', traderId: trader2Id },
  { title: 'Plumbing - Toilet Installation', description: 'Install or replace toilets professionally.', basePrice: 80, pricingType: 'fixed', category: 'Plumbing', traderId: trader2Id },
  { title: 'Painting - Exterior Walls', description: 'Exterior wall painting for houses.', basePrice: 120, pricingType: 'fixed', category: 'Painting', traderId: trader2Id },
  { title: 'Carpentry - Shelving Installation', description: 'Install shelves securely on walls.', basePrice: 50, pricingType: 'fixed', category: 'Carpentry', traderId: trader2Id }
];

// Connect to MongoDB and seed services
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    return Service.insertMany(services);
  })
  .then(inserted => {
    console.log(`Inserted ${inserted.length} services`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error seeding services:', err);
    mongoose.disconnect();
  });
