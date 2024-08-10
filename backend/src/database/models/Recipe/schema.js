//const mongoose = require('mongoose');
import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
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
  image: { type: String },
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
