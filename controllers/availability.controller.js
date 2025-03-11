const Availability = require('../Models/availability.model');
const Appointment = require('../Models/appointment.model');

exports.setAvailability = async (req, res) => {
    try {
        const { date, slots } = req.body;

        // Validate date format
        const availabilityDate = new Date(date);
        if (isNaN(availabilityDate)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Check for existing availability
        const existingAvailability = await Availability.findOne({
            professorId: req.user._id,
            date: availabilityDate
        });

        if (existingAvailability) {
            // Update existing availability
            existingAvailability.slots = slots;
            await existingAvailability.save();
            return res.json(existingAvailability);
        }

        // Create new availability
        const availability = await Availability.create({
            professorId: req.user._id,
            date: availabilityDate,
            slots
        });

        res.status(201).json(availability);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        const query = { professorId: id };
        if (date) {
            query.date = new Date(date);
        }

        const availability = await Availability.find(query)
            .populate('professorId', 'name email')
            .sort({ date: 1 });

        // Get booked appointments
        const appointments = await Appointment.find({
            professorId: id,
            status: 'booked',
            ...(date && { date: new Date(date) })
        });

        // Filter out booked slots
        const availabilityWithBookedSlots = availability.map(av => {
            const bookedSlots = appointments
                .filter(app => app.date.toISOString().split('T')[0] === av.date.toISOString().split('T')[0])
                .map(app => app.timeSlot);
            
            return {
                ...av.toObject(),
                slots: av.slots.filter(slot => !bookedSlots.includes(slot))
            };
        });

        res.json(availabilityWithBookedSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
