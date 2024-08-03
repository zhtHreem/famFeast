import React ,{createContext, useState, useContext}from "react";
import { Paper,Box,TextField,IconButton,CardMedia, Typography,Stack, Button } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from "react-router-dom";
import { useLogin } from "./logincontext";
function Login({ setLogin }){
     const [signup,setSignup]=useState(false)

     
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
                      
                       <TextField id="outlined-basic" label="Email" variant="outlined" 
                           InputProps={{ startAdornment: (   <EmailIcon sx={{ mr: 1 }} /> )}}/>
                       <TextField id="outlined-basic" label="Password"    variant="outlined" InputProps={{ startAdornment: (   <LockIcon sx={{ mr: 1 }} /> )}} sx={{ paddingBottom:3}}/> 
                        <Typography component={Link} variant="caption"  paddingLeft= {{xs:5,md:15,lg:20}} >Forget Password</Typography>
                        <Button sx={{backgroundColor:"orange",color:"black",p:2,width:"60%"}}>Log In</Button> 
                        <Typography component={Link} variant="caption" onClick={()=> setSignup(true)} >Create New Account</Typography>
                    </Stack>
                    )}

                   {signup && (<Stack paddingLeft={3} alignItems="center" paddingTop={8} spacing={2} sx={{width:"40%", height: "100%",zIndex: 3 }}>
                        <Typography variant="h3" paddingBottom={7}>Create New Account</Typography>
                      
                       <TextField id="outlined-basic" label="Email" variant="outlined" 
                           InputProps={{ startAdornment: (   <EmailIcon sx={{ mr: 1 }} /> )}}/>
                       <TextField id="outlined-basic" label="Password"    variant="outlined" InputProps={{ startAdornment: (   <LockIcon sx={{ mr: 1 }} /> )}} sx={{ paddingBottom:3}}/> 
                       <TextField id="outlined-basic" label="Confirm Password"    variant="outlined" InputProps={{ startAdornment: (   <LockIcon sx={{ mr: 1 }} /> )}} sx={{ paddingBottom:3}}/>  
                        <Button sx={{backgroundColor:"orange",color:"black",p:2,width:"60%"}}>Sign Up</Button> 
                        <Typography component={Link} variant="caption" onClick={()=> setSignup(false)}  >Login</Typography>
                    </Stack>
                    )}
                     



              </Stack>

            </Paper>

           </Box> 
    );
}


export default Login;