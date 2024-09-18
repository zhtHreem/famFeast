//const express = require('express');
import express from 'express';
import upload from '../multer.js';
import Recipe from './schema.js';
import FormData from 'form-data';
import axios from 'axios';
const router = express.Router();


// Create a new recipe
router.post('/recipes',upload.single('image'), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file.filename);
    console.log("Uploaded File:", req.file);
    const { user, name, description ,ingredients,directions} = req.body;   
   // const image = req.file.filename ;
   const image = req.file ;
   if (!image) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

        // Prepare form data for ImgBB API
        const formData = new FormData();
        formData.append('key', 'eb85fa9c85941a9e28e8f8e25311b624'); // Replace with your ImgBB API key
        formData.append('image', image.buffer, {
          filename: `${Date.now()}-${image.originalname}`,
          contentType: image.mimetype
        });
    
        // Upload image to ImgBB
        const imgBBResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
          
          headers: formData.getHeaders()
        });
    
        const imageUrl = imgBBResponse.data.data.url; // Image URL from ImgBB
        console.log(imageUrl)
    const newRecipe = new Recipe({user, name, description, ingredients, directions, image: imageUrl  });
    const savedRecipe = await newRecipe.save();
    console.log("savedRecipe",savedRecipe);
    res.status(201).json(savedRecipe);

  } catch (error) {
    console.error('Error creating Recipe:', error); 
    if (error.name === 'ValidationError') {
       res.status(400).json({ error: `Validation error: ${error.message}` });      
    }
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

// Search recipes by name
router.get('/recipes/search', async (req, res) => {
  console.log("searched recipe name:",req.query.recipe )
  try {
    
    const recipes = await Recipe.find({ name: new RegExp(req.query.recipe, 'i') });
    console.log("searched recipes list:",recipes)
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: `Error searching recipes: ${error.message}` });
  }
});

// Get recipes by user ID
router.get('/recipes/user/:userId', async (req, res) => {
  try {
    // Find recipes by userId
    console.log("idm",req.params.userId )
    const recipes = await Recipe.find({ user: req.params.userId });
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ error: 'No recipes found for this user' });
    }
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: `Error fetching recipes: ${error.message}` });
  }
});

// Read a recipe by ID
router.get('/recipes/:id', async (req, res) => {
  console.log("idm",req.params.id )
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




export default router;
