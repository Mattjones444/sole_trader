const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    traderId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Trader',
        required:true
    },
    title: {
        type:String,
        required:true,
    },
    description: {
        type:String,
        required:true,
    },
    pricingType: {
        type:String,
        enum: ['hourly','fixed'],
        required:true
    },
    basePrice: {
        type:Number,
        required:true
    }
});
module.exports = mongoose.model('Service', ServiceSchema);