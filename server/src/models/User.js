const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// TODO: Define the fields: name, email (unique, lowercase), password (select: false),
// TODO: role ('admin' | 'operator'), and lastLoginAt.
const UserSchema = new mongoose.Schema({}, { timestamps: true });

UserSchema.pre('save', async function hashPassword(next) {
  // TODO: Hash the password with bcrypt when it has been modified.
  next();
});

UserSchema.methods.comparePassword = function comparePassword(password) {
  // TODO: Compare the candidate password with the stored hash.
  return false;
};

module.exports = mongoose.model('User', UserSchema);
