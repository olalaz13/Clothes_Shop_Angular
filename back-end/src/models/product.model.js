const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  cat: { type: String, required: true },
  img: { type: String, required: true },
  desc: { type: String, required: true },
  sizes: [{ type: String }],
  colors: [{
    name: { type: String },
    hex: { type: String }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
