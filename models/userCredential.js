const mongoose = require('mongoose');

const AuthUserSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuthUser', AuthUserSchema);
