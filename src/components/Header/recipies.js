import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Box, Typography,Grid,Stack,Card,CardContent,CardMedia } from "@mui/material";
import { Link } from 'react-router-dom';

const recipes = [
    { id: 1, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 2, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 3, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 4, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 5, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 6, image: require("../../images/Bir.png"), title: 'Biryani' },
  ];
export default function Recipes(){
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    // Fetch recipes from the API
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/recipes');
        setRecipes(response.data);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      }
    };

    fetchRecipes();
  }, []);
    return(

    

     <Stack  position="relative" sx={{ backgroundColor: 'black', justifyContent: "center" ,alignItems:"center" ,overflow: 'hidden' }  }p={2}  >

       <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',left:{lg:"10%"},zIndex: 1,transform: 'rotate(180deg)', userSelect: 'none', pointerEvents: 'none'}}/>
       <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',left:{lg:"10%"},zIndex: 1, userSelect: 'none', pointerEvents: 'none'}}/>
    
       <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',right:{lg:"10%"},zIndex: 1,transform: 'rotate(0deg)', userSelect: 'none', pointerEvents: 'none'}}/>
       <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',right:{lg:"10%"},zIndex: 1,transform: 'rotate(180deg)', userSelect: 'none', pointerEvents: 'none'}}/>

        <Box component="img" src={require("../../images/s1.png")}sx={{  width:{xs:'60%',lg: '100%'}, height:{xs:'80%',lg: '50%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"20%" ,sm:'20%',md:"24%",lg:'55%'}, left: {xs:'64%',sm:'67%',md:'68%',lg:'35%'},zIndex: 1, transform: 'rotate(90deg)', userSelect: 'none', pointerEvents: 'none'}}/>
        <Box component="img" src={require("../../images/s1.png")}sx={{  width:{xs:'60%',lg: '100%'}, height:{xs:'80%',lg: '20%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"20%" ,sm:'20%',md:"24%",lg:'40%'}, right: {xs:'64%',sm:'67%',md:'68%',lg:'45%'},zIndex: 1, transform: 'rotate(270deg)', userSelect: 'none', pointerEvents: 'none'}}/>

        <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'110%',lg: '110%'}, height:{xs:'2%',sm:'4%',lg: '5%'},  objectFit: 'contain', position: 'absolute',top:{ xs:"3.5%",md:'0%'}, right: {xs:'32%',sm:'43%'},zIndex: 1, transform: 'rotate(75deg)', userSelect: 'none', pointerEvents: 'none'}}/>
        <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'110%',lg: '110%'}, height:{xs:'1%',sm:'2%',lg: '2%'},  objectFit: 'contain', position: 'absolute',top:{ xs:"10%" ,md:'10%'}, right: {xs:'34%',sm:'41%'},zIndex: 1, userSelect: 'none', pointerEvents: 'none'}}/>
        <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'60%',lg: '90%'}, height:{xs:'2%',sm:'4%',lg: '5%'},  objectFit: 'contain', position: 'absolute',top:{ xs:"23%" ,md:'23%'}, left: {xs:'60%',sm:'65%',lg:'50%'},zIndex: 1, transform: 'rotate(320deg)', userSelect: 'none', pointerEvents: 'none'}}/>
        
       

       
        <Typography textAlign="center" color={"white"} variant="h2"  paddingBottom={7} zIndex={3}>Find Your Recipe</Typography>

        <Grid container sx={{ backgroundColor: 'black' }} justifyContent="center" spacing={3} px={12}  paddingRight={3} paddingBottom={4}>
          
          { recipes.map(recipe=>(
           
          <Grid  item xs={12} sm={6} md={4} zIndex={3}  key={recipe.id}>
            <Link to={`/recipe/${recipe._id}`} style={{ textDecoration: 'none' }}> 
            <Card  sx={{maxWidth: 345,backgroundColor:"#1B1212"  , borderRadius: '16px'}}>
              <CardMedia component="img" image={`http://localhost:5000/upload/${recipe.image}`} sx={{height:300,objectFit:'fill'}}/>
               <CardContent >
                 <Typography color="white" textAlign="center"fontFamily='Fredoka One, sans-serif' variant="h5">{recipe.name}</Typography>
               </CardContent>
            </Card>  
             </Link>  

          </Grid>
          
          ))}
          
  
         
  
        </Grid>
      </Stack>



    );
}