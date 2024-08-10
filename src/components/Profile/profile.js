import React,{ useState , useEffect}  from "react";
import { Box, Typography,Grid,Paper,Link,Stack,Card,CardContent,CardMedia,IconButton} from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Layout from "../layout/layout";
import NewRecipe from "../Recipe/createNewRecipe";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useLogin} from "../Login/logincontext";
import Login from "../Login/login";
import Swal from 'sweetalert2';
import axios from 'axios';
const user=[{
    id:1,
    name:'Hareem',
   // joiningDate:Date.now(),

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
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    //const { name, joiningDate } = user[0];
    const [addrecipe,setAddRecipe]=useState(false);
    const { isLoginOpen, setLoginOpen } = useLogin();

   

    useEffect(() => {
 
      const storedUser = JSON.parse(localStorage.getItem('user'));
      console.log("user",storedUser)
      if (storedUser) {
         console.log("id",storedUser.id)
          fetchUserData(storedUser.id);
          fetchUserRecipes(storedUser.id);
      }
  }, []);

     
     // Function to fetch user data
     const fetchUserData = async (userId) => {
      Swal.fire({
        title: 'Loading...',
        
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
      try {
          const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
          setUser(response.data);
      } catch (error) {
          console.error('Error fetching user data:', error);
      }
  };

  const fetchUserRecipes = async (userId) => {
      
    try {
        const response = await axios.get(`http://localhost:5000/api/recipes/user/${userId}`);
        setRecipes(response.data);
        Swal.close(); 
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
};

   

    const handleNewRecipe=()=>{
        setAddRecipe(true)
      } 
// Ensure user data is loaded before accessing properties
if (!user) {
  return null;
}


    return(
     <Layout>

       {isLoginOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
          <Login setLogin={setLoginOpen} />
        </Box>
      )}   

    {
       <Box sx={{backgroundColor:"#FFFFF0",minHeight: '100vh'}} p={8} >
         
        <Stack direction="column" alignItems="center" justifyContent="center">
         
           <Box component="img" src={require("../../images/useravatar.png")}  alt="User Avatar"  sx={{ width: 100, height: 100, borderRadius: '50%' }} />
           <Typography variant="h3">{user.username}</Typography>
           <Typography variant="body1">date</Typography>
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

                        <CardMedia component="img" image={`http://localhost:5000/upload/${recipe.image}`} sx={{ width: 100, height: 100, borderRadius: '50%' }}/>
                        <CardContent >
                           <Typography  textAlign="center"fontFamily='Fredoka One, sans-serif' variant="h5">{recipe.name}</Typography>
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