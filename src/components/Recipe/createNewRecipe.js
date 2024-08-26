import React, { useState, useEffect  } from "react";
import { Paper,Box,TextField,IconButton,CardMedia, Typography,Stack, Button } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import axios from 'axios';
function NewRecipe({ setAddRecipe }){
      const [ingredients,setIngredients]=useState([""]);
      const [directions,setDirections]=useState([""]);
      const [description,setDescription]=useState("");
      const [image, setImage] = useState(null);
      const [imageFile, setImageFile] = useState(null);
      const [userId, setUserId] = useState(null);
      const [name, setName] = useState("Recipe name test");




      useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserId(storedUser.id);
        }
    }, []); 
    
    useEffect(() => {
        console.log("userid", userId);
    }, [userId]); 
    
    const handleEnter = async () => {
        try {

            const formData = new FormData();
            
    
      
            
    
            
            
            
            if (!imageFile ) {
                
                alert('Choose an Image.');
                return;
            }
            else if(!name){
                alert('Please enter the Recipe name.');
                return;
            }else if(!description){
                alert('Description is required.');
                return; 
            }else if(!ingredients){
                alert('Enter ingredients');
                return;
            }else if(!directions){
                alert('Enter directions.');
                return;
            }

            formData.append('user', userId);
                formData.append('name', name);
                formData.append('description', description);
                ingredients.forEach((ingredient, index) => {
                    formData.append(`ingredients[${index}]`, ingredient);
                });
                directions.forEach((direction, index) => {
                    formData.append(`directions[${index}]`, direction);
                });
        
                formData.append('image', imageFile);
    

            for (let pair of formData.entries()) {
                if (pair[0] === 'image') {
                    console.log(pair[0] + 'image: ' + pair[1].name); 
                } else {
                    console.log(pair[0] + ': ' + pair[1]);
                }
            }
            const response = await axios.post('https://fam-feast-api.vercel.app/api/recipes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Recipe created successfully:', response.data);
    
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Recipe created successfully!',
                confirmButtonText: 'OK'
            });
    
            setAddRecipe(false); // Close the form on success
        } catch (error) {
            console.error('Error creating recipe:', error);
        }
    };
    
    
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


    

    

    

     const handleImageChange = (event) => {
        console.log("handleImageChange triggered");
            const file = event.target.files[0];
            console.log("Image Data URL:", event.target.files[0]); 
            if (file) {
                setImageFile(file);
                const imageURL = URL.createObjectURL(file);
                setImage(imageURL);
                
            }
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
                        <input  type="file" name="image" accept="image/*"  hidden onChange={handleImageChange}/>
                         <CardMedia  component="img"      image={typeof image === 'string' ? image : "https://via.placeholder.com/150"}
                          alt="Selected"  sx={{ height: 150, width: '100%', objectFit: 'cover' }}/>
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