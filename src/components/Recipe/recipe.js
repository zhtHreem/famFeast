import React, { useState } from "react";
import { Box,Card,CardMedia,CardContent, Typography, Grid, Menu,Stack, Button, List, ListItem, ListItemIcon, ListItemButton } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { RadioButtonChecked } from "@mui/icons-material";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Navbar from "../Header/navbar";
import Footer from "../Footer/footer";

import { Grade } from "@mui/icons-material";

import Comments from "./comment";
const recipes =[
    {
        id:1,
         image: require("../../images/Bir.png"),
          title: 'Biryani',
          description:'Biryani is a fragrant and flavorful rice dish, originating from the Indian subcontinent, made with basmati rice, marinated meat (chicken, beef, mutton, or fish), and a blend of aromatic spices. It is often garnished with fried onions, boiled eggs, and fresh herbs, offering a rich and complex taste that is both satisfying and indulgent.' ,
          listOfIngredients: [
            'Basmati rice',
            'Chicken',
            'Yogurt',
            'Onions',
            'Tomatoes',
            'Garlic',
            'Ginger',
            'Spices (e.g., cumin, coriander, garam masala)',
            'Fresh herbs (e.g., cilantro, mint)',
            'Fried onions'
        ],
        listOfDirections: [
            '1. Marinate the chicken with yogurt and spices.',
            '2. Cook the rice separately.',
            '3. Fry onions until golden brown.',
            '4. Layer the rice and chicken in a pot, adding fried onions in between.',
            '5. Cook on low heat for 30 minutes.',
            '6. Garnish with fresh herbs and serve.'
        ]
    }
]

function Recipe(){
    const [ingredients,setIngredients]=useState(false);
    const [checkIngredients,setIngredientCheck]=useState({});
    const [description,setDescription]=useState(false);
    const[checkDescription,setDescriptionCheck]=useState([]);
    const [like, setLike] = useState(false);
    const [replyIcon,setReplyIcon]=useState(false);
    const [commentBox,setCommentBox]=useState(false);

   const handleIngradients=()=>{
     setIngredients(prevState => !prevState);
   }
   const handleIngradientCheck=(index)=>{
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
     {recipes.map(recipe=>(
     <Box  p={5} sx={{height:"100%",background:"black"}} >
       
          
        <Grid  direction="row" p={3} display={"flex"}>      
          <Card sx={{maxWidth: 345,backgroundColor:"black",borderStyle:"groove"}} >
            <CardMedia component="img" image={recipe.image}>
                
            </CardMedia>
           </Card>
              <CardContent sx={{maxWidth: 500,backgroundColor:"#1B1212"}}>
                <Typography variant="h4"  sx={{color:"white"}}>{recipe.title}</Typography>
                <Typography variant="body"  sx={{color:"white"}}>{recipe.description}</Typography>
              </CardContent>
        </Grid>  

         <Box p={3} >
          
          <Button onClick={handleIngradients} sx={{width:"100%",justifyContent: "space-between",color:"white", borderBottom: "1px outset white", }}  endIcon={<KeyboardArrowDown />}>Ingredients</Button>
          { ingredients && (
            <Box sx={{background:"black"}}>
                <List>
                    {recipe.listOfIngredients.map((ingredient,index)=>(
                       
                        <ListItemButton key={index} onClick={()=>handleIngradientCheck(index)}>
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
                    { recipe.listOfDirections.map((description,index)=>(
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
                                    <ThumbUpAltIcon sx={{color:"orange"}} onClick={handleLike}/>
                                ) :(
                                    <ThumbUpOffAltIcon sx={{color:"orange"}}onClick={handleLike}/>
                                )}
                                { replyIcon?  (
                                    
                                    <ChatBubbleIcon sx={{color:"orange"}} onClick={handleReplyIcon}  />
                                ):(
                                    <ChatBubbleOutlineIcon sx={{color:"orange"}} onClick={handleReplyIcon} />
                                )}    
          </Stack>
            

     </Box>
     ))}
    

      {replyIcon &&(
        <Comments/>
      )}  
     <Footer/>
     </>
    );
}

export default Recipe;