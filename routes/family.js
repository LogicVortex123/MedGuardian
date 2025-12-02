const express = require('express');
const router = express.Router();
const FamilyMember = require('../models/FamilyMember');

// Get family members
router.get('/:userId', async (req, res) => {
    try {
        const members = await FamilyMember.find({ userId: req.params.userId });
        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add family member
router.post('/', async (req, res) => {
    try {
        const member = new FamilyMember(req.body);
        await member.save();
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update family member
router.put('/:id', async (req, res) => {
    try {
        const member = await FamilyMember.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete family member
router.delete('/:id', async (req, res) => {
    try {
        await FamilyMember.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Family member deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
