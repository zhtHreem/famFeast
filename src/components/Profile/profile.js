import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Link, Stack, Card, CardContent, CardMedia, Button, IconButton } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Layout from "../layout/layout";
import NewRecipe from "../Recipe/createNewRecipe";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useLogin } from "../Login/logincontext";
import Login from "../Login/login";
import Swal from 'sweetalert2';
import axios from 'axios';
import Follower from "./follower";
import Following from "./following";

function Profile() {
    const { search } = useParams();
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [addRecipe, setAddRecipe] = useState(false);
    const [openFollower, setOpenFollower] = useState(false);
    const [openFollowing, setOpenFollowing] = useState(false);
    const { isLoginOpen, setLoginOpen } = useLogin();
    const currentDate = new Date().toLocaleDateString();
    const [currentUser, setCurrentUser] = useState(false);
    const [follow, setFollow] = useState(false);
    const [loggedinUser, setloggedinUser] = useState(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser) {
            setloggedinUser(storedUser.id);
            if (search === storedUser.id) {
                setCurrentUser(true);
            }
        }

        fetchUserData(search);
        fetchUserRecipes(search);
    }, [search,loggedinUser]);

    const fetchUserData = async (userId) => {
        Swal.fire({
            title: 'Loading...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Fetch the searched user data
            const { data: searchedUser } = await axios.get(`https://fam-feast-api.vercel.app/api/users/${userId}`);
            setUser(searchedUser);
            setFollowerCount(searchedUser.followers.length);
            setFollowingCount(searchedUser.following.length);

            // Fetch the logged-in user data and check follow status, only if logged in
            if (loggedinUser) {
                const { data: loggedInUserData } = await axios.get(`https://fam-feast-api.vercel.app/api/users/${loggedinUser}`);
                const isFollowing = loggedInUserData.following.includes(userId);
                setFollow(isFollowing);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            Swal.close();
        }
    };

    const fetchUserRecipes = async (userId) => {
        try {
            const response = await axios.get(`https://fam-feast-api.vercel.app/api/recipes/user/${userId}`);
            setRecipes(response.data);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            Swal.close();
        }
    };

    const handleToggleFollow = async () => {
        try {
            if (follow) {
                // Unfollow the user
                await axios.post(`https://fam-feast-api.vercel.app/api/unfollow/${search}`, { loggedInUser: loggedinUser });
            } else {
                // Follow the user
                await axios.post(`https://fam-feast-api.vercel.app/api/follow/${search}`, { loggedInUser: loggedinUser });
            }
            setFollow(!follow); // Toggle follow state
        } catch (error) {
            console.error('Error toggling follow:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again later.',
            });
        }
    };

    const handleNewRecipe = () => {
        setAddRecipe(true);
    };
    const handleOpenFollower = () => {
        setOpenFollower(true);
    };
    const handleOpenFollowing = () => {
        setOpenFollowing(true);
    };

    if (!user) {
        return null; // Wait for user data to load
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
           <Typography variant="body1">{currentDate}</Typography>
           {currentUser ? (

            
         <>
               <IconButton onClick={handleNewRecipe} sx={{color:"orange",fontWeight:"bold"}}>
                  <ArrowRightIcon/> Add recipe                 
               </IconButton>
               {addRecipe &&(
              <NewRecipe setAddRecipe={setAddRecipe}/>
               )}
                </>
            
      ) : ( loggedinUser && ( 

              <IconButton onClick={handleToggleFollow} sx={{color:"orange",fontWeight:"bold"}}>
                     {follow?      <PersonRemoveIcon />:<PersonAddIcon/> }
              </IconButton>   

                ) 
                )}  
                    
   
        </Stack> 

        <Stack direction="row" p={4} justifyContent="center" spacing={{xs:1,sm:3}}>
            
            <Paper elevation={8}   sx={{backgroundColor:"black",height:100,width:100,display: 'flex',flexDirection: 'column',alignItems:"center",padding:1,borderRadius:'10%',textAlign: 'center' ,justifyContent: 'space-around'}} >
                <Typography variant="h6" color="white">Recipes</Typography>
                <Typography variant="body2" color="white">{recipes.length}</Typography>
            </Paper>
            
            <Paper elevation={8} onClick={handleOpenFollowing}  sx={{backgroundColor:"black",height:100,width:100,display: 'flex',flexDirection: 'column',alignItems:"center",padding:1,borderRadius:'10%',textAlign: 'center' ,justifyContent: 'space-around',cursor: "pointer"}} >
                  <Button sx={{color:"white"}}>Following</Button>
                <Typography variant="body2" color="white">{followingCount}</Typography>
                {openFollowing &&(
              <Following userId={search} setOpenFollowing={setOpenFollowing}/>
               )}
            </Paper>
           <Paper  onClick={handleOpenFollower} elevation={8}   sx={{backgroundColor:"black",height:100,width:100,display: 'flex',flexDirection: 'column',alignItems:"center",padding:1,borderRadius:'10%',textAlign: 'center' ,justifyContent: 'space-around',cursor: "pointer"}} >
                <Button sx={{color:"white"}}>Follower</Button>
                <Typography variant="body2" color="white">{followerCount}</Typography>
                {openFollower &&(
              <Follower userId={search} setOpenFollower={setOpenFollower}/>
               )}
            </Paper> 
            
            
        </Stack>
        
        
        
        {recipes.length > 0 ? (
  
        <Stack  zIndex={0} justifyContent="center" spacing={{xs:1,sm:3}}>
           <Paper elevation={8}   sx={{backgroundColor:"#FFFFFF",display: 'flex',flexDirection:"column",alignItems:"center",padding:1,borderRadius:'2%',textAlign: 'center' ,justifyContent: 'space-evenly'}} >
           <Typography variant="h3" pt={4} pb={{sx:4,sm:0}} >Explore Your Recipes</Typography>
              
           
           <Grid container  justifyContent="center" spacing={3} p={{sx:4,sm:8}} >
           
             { recipes.map(recipe=>(
                <Grid component={Link} sx={{textDecoration:"none"}}  href={`/recipe/${recipe._id}`} item xs={12} sm={6} md={4} zIndex={3} p={4} key={recipe.id}>
                 
                    <Card  sx={{maxWidth: 345  ,backgroundColor:"#FFFFF0" ,borderRadius: '16px',display:"flex",alignItems:"center",justifyContent:"center"}} >

                        <CardMedia component="img" image={recipe.image} sx={{ width: 100, height: 100, borderRadius: '50%' }}/>
                        <CardContent >
                           <Typography  textAlign="center"fontFamily='Fredoka One, sans-serif' variant="h5"  sx={{textDecoration:"none"}}>{recipe.name}</Typography>
                        </CardContent>
                        <ArrowForwardIosIcon sx={{color:"black"}}/>
                   </Card>       
                </Grid>
             ))}
          </Grid>
           </Paper>
        </Stack>
           ) : (
            <Typography variant="h6" textAlign="center" color="gray" mt={4}>
                You have no recipes yet. Start by adding your first recipe!
            </Typography>
        )}
       </Box>

            }

    
             </Layout>
    );
}

export default Profile;
