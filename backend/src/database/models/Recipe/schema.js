import mongoose from 'mongoose';
import { normalizeIngredient } from '../../../utils/ingredients.js';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: String, default: '', trim: true, maxlength: 60 }, // free text: "2 cups", "1 tbsp"
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    ingredients: {
      type: [ingredientSchema],
      validate: [(v) => v.length > 0, 'At least one ingredient is required'],
    },
    // Normalized ingredient names, derived from `ingredients`; used by the pantry matcher.
    ingredientKeys: { type: [String], index: true },
    directions: {
      type: [{ type: String, trim: true, maxlength: 2000 }],
      validate: [(v) => v.length > 0, 'At least one step is required'],
    },
    image: { type: String },

    prepTime: { type: Number, min: 0, max: 10000 }, // minutes
    cookTime: { type: Number, min: 0, max: 10000 },
    servings: { type: Number, min: 1, max: 1000 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    category: { type: String, trim: true, maxlength: 60 }, // e.g. Dessert, Chicken, Breakfast
    cuisine: { type: String, trim: true, maxlength: 60 }, // e.g. Italian, Pakistani
    diets: [{ type: String, enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'] }],
    tags: [{ type: String, trim: true, maxlength: 40 }],

    // 'public' is listed on the site; 'cookbook' is visible only to members of `cookbook`.
    visibility: { type: String, enum: ['public', 'cookbook'], default: 'public', index: true },
    cookbook: { type: mongoose.Schema.Types.ObjectId, ref: 'Cookbook', index: true },
    story: { type: String, trim: true, maxlength: 1000 }, // "Nani's biryani, saffron last"

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },

    source: { name: String, url: String },
    isSeed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes that match the actual query + sort patterns (browse, filters, profile, cookbook pages).
recipeSchema.index({ visibility: 1, createdAt: -1 });
recipeSchema.index({ visibility: 1, ratingAvg: -1, ratingCount: -1 });
recipeSchema.index({ visibility: 1, saveCount: -1 });
recipeSchema.index({ visibility: 1, name: 1 });
recipeSchema.index({ visibility: 1, category: 1, createdAt: -1 });
recipeSchema.index({ visibility: 1, cuisine: 1, createdAt: -1 });
recipeSchema.index({ visibility: 1, diets: 1, createdAt: -1 });
recipeSchema.index({ user: 1, visibility: 1, createdAt: -1 });
recipeSchema.index({ cookbook: 1, createdAt: -1 });
recipeSchema.index({ visibility: 1, ingredientKeys: 1 }); // pantry matcher candidate lookup

recipeSchema.pre('validate', function (next) {
  this.ingredientKeys = [...new Set(this.ingredients.map((i) => normalizeIngredient(i.name)).filter(Boolean))];
  if (this.visibility === 'cookbook' && !this.cookbook) {
    this.invalidate('cookbook', 'A cookbook recipe needs a cookbook');
  }
  next();
});

export default mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
