const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    traderId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Trader',
        required:true,
    },
    serviceId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Service',
        required:true
    },
    clientName: {
        type:String,
        required:true
    },
    clientEmail: {
        type:String,
        required:true
    },
    requestedDateTime: {
        type:Date,
        required:true
    },
   
    jobDescription: {
        type:String,
        required:true
    },
    status: {
        type:String,
        enum: ['pending','confirmed','rejected'],
        default:'pending'
    }
})

module.exports = mongoose.model('Booking', BookingSchema);
