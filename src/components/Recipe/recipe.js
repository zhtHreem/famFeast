import React, { useState,useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { Box,Card,CardMedia,CardContent, Typography, Grid,Stack, Button,IconButton, List,ListItemIcon, ListItemButton } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { RadioButtonChecked } from "@mui/icons-material";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Navbar from "../Header/navbar";
import Footer from "../Footer/footer";
import Swal from 'sweetalert2';

import Comments from "./comment";


function Recipe(){
  const { search } = useParams(); 
    const [ingredients,setIngredients]=useState(false);
    const [checkIngredients,setIngredientCheck]=useState({});
    const [description,setDescription]=useState(false);
    const[checkDescription,setDescriptionCheck]=useState([]);
    const [like, setLike] = useState(false);
    const [replyIcon,setReplyIcon]=useState(false);
    const [commentBox,setCommentBox]=useState(false);
    const [recipe, setRecipe] = useState(null);
    const[userid,setUserId]=useState("");
   // const { recipeId } = useParams(); 
    
    console.log("Recipe id,",search)


  
    useEffect(() => {
        const fetchRecipe = async () => {
            Swal.fire({
                title: 'Loading...',
                text: 'Please wait while we fetch the recipe.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                    
                }
            });
          try { 
      //      const response = await axios.get(`https://fam-feast-api.vercel.app/api/recipes/${search}`); //https://fam-feast-api.vercel.app/api/recipes/${recipeId}
           const response = await axios.get(`https://fam-feast-api.vercel.app/api/recipes/${search}`);
             
           setRecipe(response.data);
            Swal.close(); 
            
          } catch (error) {
            console.error('Error fetching recipe:', error);
          }
        };
    
        fetchRecipe();
      }, [search]);
    
      console.log("fetched recipe,",recipe)
   
       if (!recipe) return null; 
   const handleIngredients=()=>{
     setIngredients(prevState => !prevState);
   }

   
   const handleIngredientCheck=(index)=>{
    setIngredientCheck(prevState => ({
        ...prevState,
        [index]:!prevState[index]
    }));
   }
   const handleDescription=()=>{
    setDescription(prevState => !prevState)
   }

   const handleDescriptionCheck=(index)=>{
    setDescriptionCheck(prevState=>({...prevState,[index]:!prevState[index]}))
   }

   const handleLike=()=>{
    setLike(prevState=> !prevState)
   }

const handleReplyIcon=()=>{
    setReplyIcon(prevState=> !prevState)
   } 
   const handleCommentBox=()=>{
    setCommentBox(prevState=> !prevState)
   } 

    return(
     <>
     <Navbar/> 
     
     <Box  p={{xs:2,sm:5}} sx={{height:"100%",background:"black"}} >
       
          
        <Box  p={3} display={"flex"} sx={{flexDirection: { xs: 'column', sm: 'row' }}}>      
          <Card sx={{minWidth:300,maxWidth: 345,backgroundColor:"black",borderStyle:"groove"}} >
            <CardMedia component="img" image={recipe.image} sx={{height:300}}>
                
            </CardMedia>
           </Card>
              <CardContent sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 270, maxWidth: { xs: 320, sm: 500 }, backgroundColor: "#1B1212" }}>
                  <div>
                     <Typography variant="h4" sx={{ color: "white" }}>{recipe.name}</Typography>
                     <Typography variant="body1" sx={{ color: "white" }}>{recipe.description}</Typography>
                  </div>
  
 
                   <Link variant="h5" to={`/profile/${recipe.user._id}`}  sx={{ color: "grey", alignSelf: "flex-end" }}> ~{recipe.user.username}</Link> 
             </CardContent>

          
              
        </Box>  

         <Box p={3} >
          
          <Button onClick={handleIngredients} sx={{width:"100%",justifyContent: "space-between",color:"white", borderBottom: "1px outset white", }}  endIcon={<KeyboardArrowDown />}>Ingredients</Button>
          { ingredients && (
            <Box sx={{background:"black"}}>
                <List>
                    {recipe.ingredients.map((ingredient,index)=>(
                       
                        <ListItemButton key={index} onClick={()=>handleIngredientCheck(index)}>
                            <ListItemIcon>
                            { checkIngredients[index] ? (
                              <CheckCircle sx={{color:"white"}}/>
                            ):
                            (  
                                <RadioButtonChecked sx={{color:"white"}}/>
                            )}
                            </ListItemIcon>
                           <Typography variant="body1" sx={{color:"white"}}>{ingredient}</Typography>
                        </ListItemButton>
                        
                        ))}
                </List>

            </Box> 
            )}
            
          
            <Button onClick={handleDescription} sx={{width:"100%",justifyContent:"space-between",color:"white",borderBottom: "1px ridge white",marginTop:2}} endIcon={<KeyboardArrowDown />} >Direction</Button>
           { description  && (
              <Box sx={{background:"black"}}>
                <List>
                    { recipe.directions.map((description,index)=>(
                    <ListItemButton key={index} onClick={()=> handleDescriptionCheck(index)}>
                        <ListItemIcon>
                            { checkDescription[index]? (
                                
                                 <CheckCircle sx={{color:"white"}}/>
                            ):
                            (
                                <RadioButtonChecked sx={{color:"white"}}/>
                            )}
                        </ListItemIcon>
                        <Typography variant="body1" sx={{color:"white"}}>{description}</Typography>
                    </ListItemButton>
                    ))}
                </List>

              </Box>


           )}
         </Box>
         
         <Stack direction="row" alignItems="center" spacing={2} marginLeft={2} p={2}>
                                { like? (
                                    <IconButton>
                                      <ThumbUpAltIcon sx={{color:"orange"}} onClick={handleLike}/>
                                    </IconButton>  
                                ) :(
                                    <IconButton>
                                       <ThumbUpOffAltIcon sx={{color:"orange"}}onClick={handleLike}/>
                                    </IconButton>   
                                )}
                                { replyIcon?  (
                                    <IconButton>
                                    <ChatBubbleIcon sx={{color:"orange"}} onClick={handleReplyIcon}  />
                                    </IconButton>
                                ):(
                                    <IconButton>
                                    <ChatBubbleOutlineIcon sx={{color:"orange"}} onClick={handleReplyIcon} />
                                    </IconButton>
                                )}    
          </Stack>
            

     </Box>
     
    

      {replyIcon &&(
        <Comments recipeId={search}/>
      )}  

      
     <Footer/>
     </>
    );
}

export default Recipe;