const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');

// Get all medications for a user
router.get('/:userId', async (req, res) => {
    try {
        const medications = await Medication.find({ userId: req.params.userId });
        res.json({ success: true, medications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add medication
router.post('/', async (req, res) => {
    try {
        const medication = new Medication(req.body);
        await medication.save();
        res.json({ success: true, medication });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update medication
router.put('/:id', async (req, res) => {
    try {
        const medication = await Medication.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, medication });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete medication
router.delete('/:id', async (req, res) => {
    try {
        await Medication.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Medication deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
