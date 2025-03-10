const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth.middleware');
const { setAvailability, getAvailability } = require('../Controllers/availability.controller');

router.post('/professor/availability', protect, authorize('professor'), setAvailability);
router.get('/professor/:id/availability', protect, getAvailability);

module.exports = router;
