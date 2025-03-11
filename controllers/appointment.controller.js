const Appointment = require('../Models/appointment.model');
const Availability = require('../Models/availability.model');
const mongoose = require('mongoose');

// Add proper exports object
const appointmentController = {
    bookAppointment: async (req, res) => {
        try {
            const { professorId, date, timeSlot } = req.body;
            const appointmentDate = new Date(date);

            // Check if slot is available
            const availability = await Availability.findOne({
                professorId,
                date: appointmentDate,
                slots: timeSlot
            });

            if (!availability) {
                return res.status(400).json({ message: 'Time slot not available' });
            }

            // Check if slot is already booked
            const existingAppointment = await Appointment.findOne({
                professorId,
                date: appointmentDate,
                timeSlot,
                status: 'booked'
            });

            if (existingAppointment) {
                return res.status(400).json({ message: 'Time slot already booked' });
            }

            // Create appointment
            const appointment = await Appointment.create({
                studentId: req.user._id,
                professorId,
                date: appointmentDate,
                timeSlot,
                status: 'booked'
            });

            // Update availability by removing the booked slot
            await Availability.updateOne(
                { _id: availability._id },
                { $pull: { slots: timeSlot } }
            );

            res.status(201).json(appointment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getMyAppointments: async (req, res) => {
        try {
            const query = req.user.role === 'student' 
                ? { studentId: req.user._id }
                : { professorId: req.user._id };

            const appointments = await Appointment.find(query)
                .populate('studentId', 'name email')
                .populate('professorId', 'name email')
                .sort({ date: 1, timeSlot: 1 });

            res.json(appointments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProfessorAppointments: async (req, res) => {
        try {
            const appointments = await Appointment.find({ 
                professorId: req.user._id 
            })
            .populate('studentId', 'name email')
            .sort({ date: 1, timeSlot: 1 });

            res.json(appointments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAppointmentById: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Validate if ID is valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid appointment ID format' });
            }

            console.log('Searching for appointment:', id); // Debug log

            const appointment = await Appointment.findById(id)
                .populate('studentId', 'name email')
                .populate('professorId', 'name email');

            console.log('Found appointment:', appointment); // Debug log

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Check if user is authorized to view this appointment
            const isStudent = req.user.role === 'student';
            const isProfessor = req.user.role === 'professor';
            const isOwner = isStudent ? 
                appointment.studentId._id.toString() === req.user._id.toString() :
                appointment.professorId._id.toString() === req.user._id.toString();

            console.log('Auth check:', { isStudent, isProfessor, isOwner }); // Debug log

            if (!isOwner) {
                return res.status(403).json({ message: 'Not authorized to view this appointment' });
            }

            res.json(appointment);
        } catch (error) {
            console.error('Error in getAppointmentById:', error); // Debug log
            res.status(500).json({ message: error.message });
        }
    },

    cancelAppointment: async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid appointment ID format' });
            }

            const appointment = await Appointment.findById(id)
                .populate('studentId', 'name email')
                .populate('professorId', 'name email');

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Check if professor owns this appointment
            if (appointment.professorId._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
            }

            // Check if already cancelled
            if (appointment.status === 'cancelled') {
                return res.status(400).json({ message: 'Appointment is already cancelled' });
            }

            // Update appointment status
            appointment.status = 'cancelled';
            await appointment.save();

            // Return time slot to availability
            await Availability.updateOne(
                { 
                    professorId: req.user._id,
                    date: appointment.date
                },
                { 
                    $addToSet: { slots: appointment.timeSlot }
                }
            );

            res.json(appointment);
        } catch (error) {
            console.error('Error in cancelAppointment:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = appointmentController;
