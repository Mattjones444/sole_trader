const mongoose = require('mongoose');

const TraderSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        trim:true
    },
    username: {
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email: {
        type:String,
        reuqired:true,
        unique:true,
        trim:true,
        match:[/.+@.+\..+/, 'Invalid email format']
    },
    password: {
        type:String,
        required:false,
        trim:true
    },

    //Profile Fields
    tradeType: {
        type:String,
        required:false,
        trim:true,
    },
    region: {
        type:String,
        required:false,
        trim:true
    },
    availability: {
        type:String,
        required:false,
        trim:true
    },
    bio: {
        type:String,
        required:false,
        trim:true,
        maxlength:500
    },

    //Ratings
     ratings: [
        {
            stars: { type: Number, min: 1, max: 5 },
            date: { type: Date, default: Date.now }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    }

},
{
    timestamps: true  
});


TraderSchema.methods.updateAverageRating = function () {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
    } else {
        const total = this.ratings.reduce((sum, r) => sum + r.stars, 0);
        this.averageRating = total / this.ratings.length;
    }
    return this.save();
};

module.exports = mongoose.model('Trader', TraderSchema);

