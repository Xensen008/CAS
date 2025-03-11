const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth.middleware');
const appointmentController = require('../Controllers/appointment.controller');

router.post('/book', protect, authorize('student'), appointmentController.bookAppointment);
router.get('/mine', protect, appointmentController.getMyAppointments);
router.get('/professor', protect, authorize('professor'), appointmentController.getProfessorAppointments);
router.get('/:id', protect, appointmentController.getAppointmentById);
router.put('/:id/cancel', protect, authorize('professor'), appointmentController.cancelAppointment);

module.exports = router;
