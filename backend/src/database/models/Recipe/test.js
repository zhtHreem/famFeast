const mongoose = require('mongoose');
const connectDB = require('../../connectivity'); 
const Recipe = require('./schema'); 

const runTest = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected...');

    // Create a new recipe
    const recipeData = {
      name: 'Spaghetti Bolognese',
      description: 'A classic Italian pasta dish.',
      ingredients: ['spaghetti', 'ground beef', 'tomato sauce'],
      directions: ['Cook the spaghetti', 'Prepare the sauce', 'Combine and serve'],
    };

    let newRecipe = new Recipe(recipeData);
    await newRecipe.save();
    console.log('Recipe created:', newRecipe);

    // Read all recipes
    const allRecipes = await Recipe.find();
    console.log('All recipes:', allRecipes);


    // Search recipes by name
    const searchQuery = 'Spaghetti';
    const searchedRecipes = await Recipe.find({ name: new RegExp(searchQuery, 'i') }); // Case-insensitive search
    console.log('Searched recipes:', searchedRecipes);


    // Update a recipe by ID
    const updatedRecipe = await Recipe.findByIdAndUpdate(newRecipe._id, { name: 'Updated Spaghetti Bolognese' }, { new: true });
    console.log('Updated recipe:', updatedRecipe);



    // Delete a recipe by ID
    await Recipe.findByIdAndDelete(newRecipe._id);
    console.log('Recipe deleted');

   
    // Close the database connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error in test:', error);
  }
};

runTest();
