
import React from "react";
import { memo } from "react";
import { Stack,Box, IconButton, Typography,TextField,Button } from "@mui/material";
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import Penguin from "../kawai/penguin";

function  Footer(){
    return(
 

   <Box paddingLeft={{xs:2,md:7}} paddingRight={{xs:2,md:7}} position="relative" sx={{backgroundColor:"black" ,overflow: 'hidden' }}>   

    <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',left:{lg:"10%"},zIndex: 1,transform: 'rotate(180deg)', userSelect: 'none', pointerEvents: 'none'}}/>
    <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',left:{lg:"10%"},zIndex: 1, userSelect: 'none', pointerEvents: 'none'}}/>
    
    <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',right:{lg:"10%"},zIndex: 1,transform: 'rotate(0deg)', userSelect: 'none', pointerEvents: 'none'}}/>
    <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',right:{lg:"10%"},zIndex: 1,transform: 'rotate(180deg)', userSelect: 'none', pointerEvents: 'none'}}/>

   
    <Box component="img" src={require("../../images/s1.png")}sx={{  width:{xs:'60%',lg: '100%'}, height:{xs:'80%',sm:'50%'},  objectFit: 'contain', position: 'absolute',top:{ xs:"52%",sm:"",lg:"52%"  }, right: {xs:'42%',sm:'58%',lg:"42%" },zIndex: 1, transform: 'rotate(270deg)', userSelect: 'none', pointerEvents: 'none'}}/> 
   
   
    <Box direction="row" sx={{backgroundColor:"black",padding: 4, border: '2px solid',borderColor: 'white', borderRadius: 1 }} alignItems="center"  justifyContent="center">
    
    <Box >
     <Stack direction="row" alignItems="center" justifyContent="center" sx={{zIndex:2,position: 'relative'}}>
        <IconButton style={{ color: 'white' }} size="large" > <LocalPostOfficeIcon sx={{fontSize: {sm:30,md:48} }} /></IconButton>
        <Typography variant="h3" sx={{  fontSize: { xs: '1.75rem',sm: '2.25rem',md: '2.75rem',lg: '3rem', xl: '3.5rem', }, color: 'white' }} >Subscribe</Typography>
     </Stack>
     <Typography variant="h5" style={{color:"white", textAlign: 'center',zIndex:2,position: 'relative'}} sx={{  fontSize: { xs: '1rem',sm: '1.25rem',lg: '1.75rem'}}} justifyContent="center" >
        <span>Subscribe today to receive delectable recipes and</span><br/>
        <span>savvy seasonal cooking advice crafted to ensure you</span><br/> 
        <span>savor every bite, from breakfast through dessert.</span>
     </Typography>
     <Stack direction="row" spacing={2} justifyContent="center" p={2} sx={{zIndex:2,position: 'relative'}}>
        <TextField  id="filled-basic" label="Your Email" variant="filled" sx={{width:{xs:"70%",sm:"50%",md:"25%"},backgroundColor:"grey" ,color:"white" }}/>
        <Button sx={{backgroundColor:"#FFD700",color:"black",width:"10%"}}>Yes Please</Button>
     </Stack> 
    </Box>    

    <Stack direction="row"  justifyContent="space-around"  paddingTop={7} paddingBottom={4} sx={{zIndex:2,position: 'relative'}}>
        
        <Stack direction="column" alignItems="center">
            <Typography variant="h4"  sx={{ textAlign:"center", fontSize: { xs: '1.5rem',sm: '2.25rem',md: '2.75rem',lg: '3rem', xl: '3.5rem' },   color: 'white',  }}>Quick links</Typography>
            <Typography variant="body2" style={{color:"white"}}sx={{  fontSize: { xs: '0.75rem',sm: '1.25rem',lg: '1.75rem'}}}>Home</Typography>
            <Typography variant="body2" style={{color:"white"}}sx={{  fontSize: { xs: '0.75rem',sm: '1.25rem',lg: '1.75rem'}}}>Recipes</Typography>
            <Typography variant="body2" style={{color:"white"}}sx={{  fontSize: { xs: '0.75rem',sm: '1.25rem',lg: '1.75rem'}}}>About Us</Typography>
            <Typography variant="body2" style={{color:"white"}}sx={{  fontSize: { xs: '0.75rem',sm: '1.25rem',lg: '1.75rem'}}}>Recipes</Typography>
        </Stack>
        <Stack direction="column"  alignItems="center">
            <Typography variant="h4"  sx={{  fontSize: { xs: '1.5rem',sm: '2.25rem',md: '2.75rem',lg: '3rem', xl: '3.5rem' },   color: 'white',  }}>Follow Us</Typography>
            <Typography variant="body2" style={{color:"white"}}>FamFeast@gmail.com</Typography>
            <Typography variant="body2" style={{color:"white"}}></Typography>

        </Stack>
        

    </Stack>
    <Typography variant="body2"  paddingTop={{xs:4,md:6}} style={{ color: 'white', textAlign: 'center' }}>
      COPYRIGHT © 2024 FAMFEST | <a href="#" style={{ color: 'white', textDecoration: 'underline' }}>PRIVACY POLICY</a>
    </Typography>
    </Box>

</Box> 
    );
}

export default memo(Footer);