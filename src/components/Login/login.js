import React ,{ useState}from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Paper,Box,TextField,IconButton,CardMedia, Typography,Stack, Button } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from "react-router-dom";
import { useLogin } from "./logincontext";
import Navbar from "../Header/navbar";
import axios from 'axios';

const baseURL = 'https://fam-feast-api.vercel.app/api';

function Login({ setLogin }){
     const navigate = useNavigate();
     const [signup,setSignup]=useState(false)
     const [email, setEmail] = useState('');
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     
     

     const handleLogin = async () => {
        try {
          const response = await axios.post('https://fam-feast-api.vercel.app/api/users/login', {
            email,
            password
          });
      
          const { user } = response.data;
          console.log('Before:', user);
      
          // Save user data to local storage
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Login successful:', user);

          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'You have logged in successfully.',
            confirmButtonText: 'OK'
          });
          
          setLogin(false); 
          
          window.location.reload();
          navigate('/');   //to homepage
          
      
        } catch (error) {
          if (error.response) {
            // Server responded with a status other than 2xx
            console.error('Login failed:', error.response.status, error.response.data);
            Swal.fire({
              icon: 'error',
              title: 'Login Failed!',
              text: error.response.data.error || 'Invalid email or password. Please try again.',
              confirmButtonText: 'OK'
            });
            
          } else if (error.request) {
            // No response was received
            console.error('Login failed:', error.request);
            Swal.fire({
              icon: 'error',
              title: 'Login Failed!',
              text: 'No response from server. Please try again later.',
              confirmButtonText: 'OK'
            });
            
          } else {
            // Something else happened while setting up the request
            console.error('Login failed:', error.message);
            Swal.fire({ icon: 'error', title: 'Login Failed!',  text: 'An unexpected error occurred. Please try again.',   confirmButtonText: 'OK' });
          }
        }
      };

      const handleSignup = async () => {
        try {
           // const response = await axios.post('https://fam-feast-api.vercel.app/api/users', {
              
             const response = await axios.post('https://fam-feast-api.vercel.app/api/users', { 
                username,
                email,
                password
            });
            console.log('User created successfully:', response.data);
 
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'User created successfully!',
                text:'Now Login',
                confirmButtonText: 'OK'
            });      
            setSignup(false);

        } catch (error) {
            if (error.response) {
    
                console.error('Signup failed:', error.response.status, error.response.data);

                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: error.response.data.error || 'Signup failed. Please try again.',
                    confirmButtonText: 'OK'
                });
            } else if (error.request) {
                // No response was received
                console.error('Signup failed:', error.request);

                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'Signup failed. No response from server.',
                    confirmButtonText: 'OK'
                });
            } else {
                // Something else happened while setting up the request
                console.error('Signup failed:', error.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'Signup failed. Please try again.',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    return(
        <Box  sx={{ position: 'relative', zIndex: 1,backgroundColor: 'rgba(0, 0, 0, 0.5)',width:{xs:"100%",sm:"90%",md:"80%"},top:{sm:"5%"},left:{sm:"5%",md:"10%"},overflow: 'hidden'}} >
            <Paper sx={{p:{xs:3,md:6},height:"80vh"}}  elevation={24}>
               <IconButton onClick={() => setLogin(false)}>
                    <CloseIcon/>
                </IconButton>
              <Stack direction="row" sx={{ height: "100%" }} >
                   
                    <Box sx={{backgroundColor:"black",    borderRadius: {xs:"0% 100% 9% 91% / 0% 64% 36% 100% ",md:'71% 29% 9% 91% / 34% 68% 32% 66% '},width:{xs:"55%",sm:"60%"}, position: 'relative'}} >
                      <Box component="img" src={require("../../images/cchef.png")}sx={{  width:{xs:'90vw',md: '100vw'},height:{xs:"90vh",md:"100vh"},objectFit: 'contain',position:"absolute",top:{xs:"4%",md:"-15%"},left:{xs:"-10%",md:"-50%",lg:"-30%"},zIndex: 2,userSelect: 'none', pointerEvents: 'none'}}/>
                      <Box component="img" src={require("../../images/ratatouille.png")}sx={{  width:{xs: '20vw'},height:"20vw",position:"absolute",top:"40%",left:"10%",zIndex: 1,userSelect: 'none', pointerEvents: 'none'}}/>
 
                    </Box>
                   
                    { !signup && (<Stack paddingLeft={3} alignItems="center" paddingTop={8} spacing={2} sx={{width:"40%", height: "100%",zIndex: 3 }}>
                        <Typography variant="h3" paddingBottom={7}>Login</Typography>
                      
                       <TextField id="outlined-basic" label="Email" variant="outlined" value={email} onChange={(e)=>setEmail(e.target.value)}
                           InputProps={{ startAdornment: (   <EmailIcon sx={{ mr: 1 }} /> )}}/>
                       <TextField id="outlined-basic" label="Password"    variant="outlined"  value={password} onChange={(e) => setPassword(e.target.value)} InputProps={{ startAdornment: (   <LockIcon sx={{ mr: 1 }} /> )}} sx={{ paddingBottom:3}}/> 
                        <Typography component={Link} variant="caption"  paddingLeft= {{xs:5,md:15,lg:20}} >Forget Password</Typography>
                        <Button sx={{backgroundColor:"orange",color:"black",p:2,width:"60%"}} onClick={handleLogin}>Log In</Button> 
                        <Typography component={Link} variant="caption" onClick={()=> setSignup(true)} >Create New Account</Typography>
                    </Stack>
                    )}

                   {signup && (<Stack paddingLeft={3} alignItems="center" paddingTop={1} spacing={2} sx={{width:"40%", height: "100%",zIndex: 3 }}>
                        <Typography variant="h3" paddingBottom={4}>Create New Account</Typography>
                      

                        <TextField id="outlined-basic" label="username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)}
                           InputProps={{ startAdornment: (   <EmailIcon sx={{ mr: 1 }} /> )}}/>
                       <TextField id="outlined-basic" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)}
                           InputProps={{ startAdornment: (   <EmailIcon sx={{ mr: 1 }} /> )}}/>
                       <TextField id="outlined-basic" label="Password"    variant="outlined" value={password}  onChange={(e) => setPassword(e.target.value)} InputProps={{ startAdornment: (   <LockIcon sx={{ mr: 1 }} /> )}} sx={{ paddingBottom:1}}/> 
                       <TextField id="outlined-basic" label="Confirm Password"    variant="outlined" value={confirmPassword}  onChange={(e) => setConfirmPassword(e.target.value)} InputProps={{ startAdornment: (   <LockIcon sx={{ mr: 1 }} /> )}} sx={{ paddingBottom:2}}/>  
                        <Button sx={{backgroundColor:"orange",color:"black",p:2,width:"60%"}} onClick={handleSignup}>Sign Up</Button> 
                        <Typography component={Link} variant="caption" onClick={()=> setSignup(false)}  >Login</Typography>
                    </Stack>
                    )}
                     
              </Stack>

            </Paper>

           </Box> 
    );
}


export default Login;
