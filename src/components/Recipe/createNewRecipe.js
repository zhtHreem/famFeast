import React, { useState } from "react";
import { Paper,Box,TextField,IconButton,CardMedia, Typography,Stack, Button } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
function NewRecipe({ setAddRecipe }){
      const [ingredients,setIngredients]=useState([""]);
      const [directions,setDirections]=useState([""]);
      const [description,setDescription]=useState("");
      const [image, setImage] = useState(null);
    const handleAddIngredients=()=>{
           setIngredients([...ingredients,""])
    }  

    const handleIngredientsChange=(index,event)=>{
        const newIngredients=[...ingredients];
        newIngredients[index]=event.target.value;
        setIngredients(newIngredients);
        
        }
    
     const handleAddDirections=()=>{
            setDirections([...directions,""])
     }  
 
     const handleDirectionsChange=(index,event)=>{
         const newDirections=[...directions];
         newDirections[index]=event.target.value;
         setDirections(newDirections);
         
         } 


    const handleEnter=()=>{
        console.log(ingredients);
        console.log(directions);
    }    

    

    

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                convertToPNG(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertToPNG = (dataURL) => {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            // Create a canvas element to process the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);

            // Convert the canvas content to a PNG data URL
            const pngDataURL = canvas.toDataURL('image/png');

            // Update state with the PNG data URL
            setImage(pngDataURL);
        };
    };
    return(
         <Box  sx={{position: 'absolute', zIndex: 4,backgroundColor: 'rgba(0, 0, 0, 0.5)',width:"80%",top:"10%",left:"10%"}}>
            <Paper sx={{p:{xs:3,sm:6}}} elevation={24}>
                <IconButton onClick={() => setAddRecipe(false)}>
                    <CloseIcon/>
                </IconButton>
               <Typography variant="h3" sx={{textAlign:"center"}}>Create New Recipe</Typography>
                <Stack direction={{xs:"column",md:"row"}} justifyContent="space-between">
                  <Stack>  
                  
                   <Typography variant="h4" sx={{marginTop:4}}>Add Ingredients</Typography> 
                   <Stack spacing={2} p={2}>
                   {ingredients.map((ingredient,index)=>
                    <Stack direction="column" >
                      <Stack direction="row" spacing={2} alignItems="center">
                      
                       <TextField key={index} label={`Ingredient ${index+1}`} value={ingredient} onChange={(event)=> handleIngredientsChange(index, event)}/> 
                       <IconButton onClick={handleAddIngredients} >
                          <AddCircleOutlineIcon />
                        </IconButton>
                       </Stack>  
                    </Stack> 
                    )} 
                    </Stack>

                    <Typography variant="h4" >Add Directions</Typography> 
                     <Stack spacing={2} p={2}>
                      {directions.map((direction,index)=>
                       <Stack direction="column" >
                       <Stack direction="row" spacing={2} alignItems="center">
                      
                       <TextField key={index} label={`Direction ${index+1}`} value={direction} onChange={(event)=> handleDirectionsChange(index, event)}/> 
                       <IconButton onClick={handleAddDirections} >
                          <AddCircleOutlineIcon />
                        </IconButton>
                       </Stack>  
                    </Stack> 
                    )} 
                    </Stack>
                </Stack>
                <Stack p={4} spacing={4}>
                  <Typography variant="h6">Add Image</Typography>
                     <Paper component="label" sx={{ position: 'relative', padding: 3, backgroundColor: "lightgrey", cursor: "pointer" }}>
                        <input  type="file"  accept="image/*"  hidden onChange={handleImageChange}/>
                         <CardMedia  component="img"  image={image || "https://via.placeholder.com/150"}  alt="Selected"  sx={{ height: 150, width: '100%', objectFit: 'cover' }}/>
                         {!image && (
                       <Box sx={{ position: 'absolute', top: 0,left: 0, height: '100%', width: '100%', display: 'flex',alignItems: 'center',justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                          <IconButton size="large">
                              <AddIcon sx={{ color: "black" }} />
                          </IconButton>
                       </Box>
                        )}
                    </Paper>
                

                  <TextField   label="Description" value={description}  onChange={(e) => setDescription(e.target.value)}   multiline rows={6}  sx={{ width: "100%", border: "1px ridge white" }}   />
                  <Button sx={{color:"black",backgroundColor:"yellow"}}onClick={handleEnter}>Enter</Button>
                </Stack>
                </Stack>

                   
                 
            </Paper>
         </Box>   
    );  
    
}

export default NewRecipe;