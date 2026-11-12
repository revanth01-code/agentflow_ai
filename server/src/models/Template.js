const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'automation' },
  tags: [{ type: String }],
  workflow: { type: mongoose.Schema.Types.Mixed, required: true },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

TemplateSchema.index({ isPublished: 1, category: 1 });

module.exports = mongoose.model('Template', TemplateSchema);
