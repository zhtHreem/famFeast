import fetch from 'node-fetch';
import connectDB from '../../connectivity.js'; // Your database connection module
import mongoose from 'mongoose';

const runTest = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected...');

    const baseURL = 'http://localhost:5000/api'; // Base URL for API

    // Create a new recipe
    let response = await fetch(`${baseURL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Recipe',
        description: 'This is a test recipe',
        ingredients: ['Ingredient 1', 'Ingredient 2'],
        directions: ['Step 1', 'Step 2']
      }),
    });
    let responseText = await response.text();
    console.log('Response text (create):', responseText);
    let recipe = JSON.parse(responseText);
    console.log('Recipe created:', recipe);

    
    const recipeId = recipe._id; // Store the created recipe ID
    const recipeName=recipe.name;


    // Read all recipes
    response = await fetch(`${baseURL}/recipes`);
    responseText = await response.text();
    console.log('Response text (all recipes):', responseText);
    let recipes = JSON.parse(responseText);
    console.log('All recipes:', recipes);

    // Read recipe by ID
    response = await fetch(`${baseURL}/recipes/${recipeId}`);
    responseText = await response.text();
    console.log('Response text (recipe by ID):', responseText);
    const recipeById = JSON.parse(responseText);
    console.log('Recipe by ID:', recipeById);
   

    //read by name
    response = await fetch(`${baseURL}/recipes/search?name=${encodeURIComponent(recipeName)}`);
    responseText = await response.text();
    console.log('Response text (recipe by Name):', responseText);
    const recipeByName = JSON.parse(responseText);
    console.log('Recipe by Name:', recipeByName);

    // Update recipe by ID
    response = await fetch(`${baseURL}/recipes/${recipeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Test Recipe',
        description: 'This is an updated test recipe'
      }),
    });
    responseText = await response.text();
    console.log('Response text (update):', responseText);
    if (response.ok) {
      const updatedRecipe = JSON.parse(responseText);
      console.log('Updated recipe:', updatedRecipe);
    } else {
      console.error('Failed to update recipe:', response.status, response.statusText);
    }

    // Delete recipe by ID
    response = await fetch(`${baseURL}/recipes/${recipeId}`, { method: 'DELETE' });
    responseText = await response.text();
    console.log('Response text (delete):', responseText);
    console.log('Recipe deleted:', responseText);

    // Verify deletion
    response = await fetch(`${baseURL}/recipes/${recipeId}`);
    responseText = await response.text();
    console.log('Response text (verify deletion):', responseText);
    if (response.status === 404) {
      console.log('Deleted recipe verification: Recipe not found (as expected)');
    } else {
      console.log('Deleted recipe verification:', JSON.parse(responseText));
    }

    // Close the MongoDB connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error in test:', error);
  }
};

// Run the test
runTest();
