const express = require('express');
const router = express.Router();
const IntakeRecord = require('../models/IntakeRecord');
const Medication = require('../models/Medication');
const FamilyMember = require('../models/FamilyMember');
const Notification = require('../models/Notification');

// Record intake
router.post('/', async (req, res) => {
    try {
        const { userId, medicationId, photo } = req.body;
        const now = new Date();

        const record = new IntakeRecord({
            userId,
            medicationId,
            timestamp: now,
            date: now.toISOString().split('T')[0],
            photo: photo || null,
            status: 'taken'
        });

        await record.save();

        // Notify family members
        const medication = await Medication.findById(medicationId);
        const familyMembers = await FamilyMember.find({ userId });

        for (const member of familyMembers) {
            const notification = new Notification({
                userId,
                familyMemberId: member._id,
                medicationName: medication.name,
                status: 'taken',
                message: `${medication.name} was taken at ${now.toLocaleTimeString()}`
            });
            await notification.save();
        }

        res.json({ success: true, record });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get intake records
router.get('/:userId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { userId: req.params.userId };

        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await IntakeRecord.find(query).sort({ timestamp: -1 });
        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get adherence stats
router.get('/:userId/stats', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const medications = await Medication.find({ userId: req.params.userId });
        const records = await IntakeRecord.find({
            userId: req.params.userId,
            date: {
                $gte: startDate.toISOString().split('T')[0],
                $lte: endDate.toISOString().split('T')[0]
            }
        });

        let totalExpected = 0;
        medications.forEach(med => {
            const match = med.frequency.toLowerCase().match(/(\d+)/);
            const dailyDoses = match ? parseInt(match[1]) : 1;
            totalExpected += dailyDoses * days;
        });

        const totalTaken = records.length;
        const adherenceRate = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;

        res.json({
            success: true,
            stats: {
                totalExpected,
                totalTaken,
                adherenceRate,
                days
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
