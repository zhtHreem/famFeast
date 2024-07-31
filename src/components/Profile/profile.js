import React,{ useState }  from "react";
import { Box, Typography,Grid,Paper,Link,Stack,Card,CardContent,CardMedia,Button,IconButton} from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Layout from "../layout/layout";
import NewRecipe from "../Recipe/createNewRecipe";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
const user=[{
    id:1,
    name:'Hareem',
    joiningDate:Date.now(),

}]

const recipes = [
    { id: 1, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 2, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 3, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 4, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 5, image: require("../../images/Bir.png"), title: 'Biryani' },
    { id: 6, image: require("../../images/Bir.png"), title: 'Biryani' },
  ];
const recipeCount = recipes.length ;
const displays=[{name:'Recipe Count',count:recipeCount},{name:'Likes',count:1},{name:'lsaa',count:0}]
  
function Profile(){
    const { name, joiningDate } = user[0];
    const [addrecipe,setAddRecipe]=useState(false);


    const handleNewRecipe=()=>{
        setAddRecipe(true)
      } 
    return(
     <Layout>

    {
       <Box sx={{backgroundColor:"#FFFFF0",minHeight: '100vh'}} p={8} >
         
        <Stack direction="column" alignItems="center" justifyContent="center">
         
           <Box component="img" src={require("../../images/useravatar.png")}  alt="User Avatar"  sx={{ width: 100, height: 100, borderRadius: '50%' }} />
           <Typography variant="h3">{name}</Typography>
           <Typography variant="body1">{new Date(joiningDate).toLocaleDateString()}</Typography>
           <IconButton onClick={handleNewRecipe} sx={{color:"orange",fontWeight:"bold"}}>
              <ArrowRightIcon/> Add recipe                 
           </IconButton>
           {addrecipe &&(
          <NewRecipe setAddRecipe={setAddRecipe}/>
    )}
        </Stack> 

        <Stack direction="row" p={4} justifyContent="center" spacing={{xs:1,sm:3}}>
            {displays.map(display=>
            <Paper elevation={8}   sx={{backgroundColor:"black",height:100,width:100,display: 'flex',flexDirection: 'column',alignItems:"center",padding:1,borderRadius:'10%',textAlign: 'center' ,justifyContent: 'space-around'}} >
                <Typography variant="h6" color="white">{display.name}</Typography>
                <Typography variant="body2" color="white">{display.count}</Typography>
            </Paper>
            )}
            
        </Stack>
        
        
        
        <Stack  zIndex={0} justifyContent="center" spacing={{xs:1,sm:3}}>
           <Paper elevation={8}   sx={{backgroundColor:"#FFFFFF",display: 'flex',flexDirection:"column",alignItems:"center",padding:1,borderRadius:'2%',textAlign: 'center' ,justifyContent: 'space-evenly'}} >
           <Typography variant="h3" pt={4} pb={{sx:4,sm:0}} >Explore Your Recipes</Typography>
              
           
           <Grid container  justifyContent="center" spacing={3} p={{sx:4,sm:8}} >
           
             { recipes.map(recipe=>(
                <Grid component={Link}  href="/recipe" item xs={12} sm={6} md={4} zIndex={3} p={4} key={recipe.id}>
                    <Card  sx={{maxWidth: 345  ,backgroundColor:"#FFFFF0" ,borderRadius: '16px',display:"flex",alignItems:"center",justifyContent:"center"}} >

                        <CardMedia component="img" image={recipe.image} sx={{ width: 100, height: 100, borderRadius: '50%' }}/>
                        <CardContent >
                           <Typography  textAlign="center"fontFamily='Fredoka One, sans-serif' variant="h5">{recipe.title}</Typography>
                        </CardContent>
                        <ArrowForwardIosIcon sx={{color:"black"}}/>
                   </Card>       
                </Grid>
             ))}
          </Grid>
           </Paper>
        </Stack>
         
       </Box>

            }

    
             </Layout>
    );
}

export default Profile;