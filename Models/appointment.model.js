const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    professorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled'],
        default: 'booked'
    }
}, {
    timestamps: true
});

// Compound index to prevent double booking
AppointmentSchema.index({ professorId: 1, date: 1, timeSlot: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
