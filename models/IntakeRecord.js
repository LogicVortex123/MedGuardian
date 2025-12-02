const mongoose = require('mongoose');

const intakeRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    date: {
        type: String,
        required: true
    },
    photo: {
        type: String, // Base64 encoded image
        default: null
    },
    status: {
        type: String,
        default: 'taken'
    }
});

module.exports = mongoose.model('IntakeRecord', intakeRecordSchema);
