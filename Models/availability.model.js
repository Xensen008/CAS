const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AvailabilitySchema = new Schema({
    professorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    slots: [{
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid time format!`
        }
    }]
}, {
    timestamps: true
});

// Compound index to prevent duplicate dates for same professor
AvailabilitySchema.index({ professorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);
