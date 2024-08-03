const express = require('express');
const Recipe = require('./schema'); 

const router = express.Router();

// Create a new recipe
router.post('/recipes', async (req, res) => {
  try {
    const { name, description, ingredients, directions } = req.body;
    const newRecipe = new Recipe({ name, description, ingredients, directions });
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(500).json({ error: `Error creating recipe: ${error.message}` });
  }
});

// Read all recipes
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: `Error fetching recipes: ${error.message}` });
  }
});

// Read a recipe by ID
router.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: `Error fetching recipe: ${error.message}` });
  }
});

// Update a recipe by ID
router.put('/recipes/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ error: `Error updating recipe: ${error.message}` });
  }
});

// Delete a recipe by ID
router.delete('/recipes/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: `Error deleting recipe: ${error.message}` });
  }
});

// Search recipes by name
router.get('/recipes/search', async (req, res) => {
  try {
    const { name } = req.query;
    const recipes = await Recipe.find({ name: new RegExp(name, 'i') });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: `Error searching recipes: ${error.message}` });
  }
});

module.exports = router;
