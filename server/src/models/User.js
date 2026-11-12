const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../utils/crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  geminiApiKey: { type: String, default: '', select: false },
  openrouterApiKey: { type: String, default: '', select: false },
  role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
  lastLoginAt: { type: Date }
}, { timestamps: true });

UserSchema.pre('save', async function hashPassword(next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    for (const field of ['geminiApiKey', 'openrouterApiKey']) {
      if (this.isModified(field) && this[field]) {
        this[field] = encrypt(this[field]);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
