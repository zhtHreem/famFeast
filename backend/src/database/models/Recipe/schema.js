const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      type: String,
      required: true,
    }
  ],
  directions: [
    {
      type: String,
      required: true,
    }
  ],
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
