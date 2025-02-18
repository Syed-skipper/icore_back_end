const mongoose = require('mongoose');

const UploadedUserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, match: /^\d{10}$/ },
    city: { type: String, required: true },
    state: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UploadedUser', UploadedUserSchema);
