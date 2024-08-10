import React, { useState,useEffect } from "react";
import { Stack,Link,Box, IconButton, Typography,Button } from "@mui/material";
import FoodBankIcon from '@mui/icons-material/FoodBank';
import SearchIcon from '@mui/icons-material/Search';
import TableRowsIcon from '@mui/icons-material/TableRows';
import Header from "./header";
import { useLogin } from "../Login/logincontext";
export default function Navbar(){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    
    }
  }, []);
  
  const { setLoginOpen } = useLogin();

    
    return(
        <>
        <Box  position="relative" sx={{  backgroundColor:"black", py:2, px:3,overflow: 'hidden'  }}>
       
        <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',left:{lg:"10%"},zIndex: 1,transform: 'rotate(180deg)', userSelect: 'none', pointerEvents: 'none'}}/>
        <Box component="img" src={require("../../images/black.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'110%'},  opacity: 0.2,  objectFit: 'cover', position: 'absolute',right:{lg:"10%"},zIndex: 1, userSelect: 'none', pointerEvents: 'none'}}/>

        <Box component="img" src={require("../../images/s1.png")}sx={{  width:{xs:'60%',lg: '100%'}, height:{xs:'80%',lg: '80%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"20%" ,sm:'20%',md:"24%",lg:'17%'}, right: {xs:'64%',sm:'67%',md:'68%',lg:'48%'},zIndex: 1, userSelect: 'none', pointerEvents: 'none' }}/>
        <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'60%',lg: '90%'}, height:{xs:'55%',lg: '80%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"45%" ,lg:'23%'}, right: {xs:'28%',sm:'36%',md:'47%',lg:'38%'},zIndex: 1, transform: 'rotate(320deg)',userSelect: 'none', pointerEvents: 'none'}}/>
        <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'110%',lg: '110%'}, height:{xs:'30%',lg: '40%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"17%",sm:'15%' ,lg:'6%'}, right: {xs:'32%',sm:'34%',md:'37%',lg:'40%'},zIndex: 1, transform: 'rotate(45deg)', userSelect: 'none', pointerEvents: 'none'}}/>
        <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'110%',lg: '110%'}, height:{xs:'18%',lg: '20%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"35%" ,sm:'33%',lg:'30%'}, right: {xs:'34%',sm:'36%',md:'38%',lg:'41%'},zIndex: 1, userSelect: 'none', pointerEvents: 'none'}}/>

        <Box component="img" src={require("../../images/gold.png")}sx={{  width:{xs:'60%',lg: '40%'}, height:{xs:'70%',lg: ' 100%'},  objectFit: 'cover', position: 'absolute',bottom:{ xs:"100%" ,md:'160%',lg:'170%'}, left: {xs:'45%',md:'47%',lg:'65%'},zIndex: 1,transform: 'rotate(50deg)', userSelect: 'none', pointerEvents: 'none' }}/>
         
          <Stack direction={"row"} sx={{color:"white" ,justifyContent:"space-between"}}>


            <Stack  direction="row" sx={{alignItems:"center" }}>
              <IconButton>
                  <FoodBankIcon fontSize="large" sx={{color:"black"}}/>
              </IconButton>
              <Typography color="white" fontWeight="Bold" variant="h5">FamFeast </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center"> 

               <Link href="/" underline="none" sx={{color:"white"}} fontWeight="bold">Home </Link>
               <Link href="/profile" underline="none"sx={{color:"white"}} fontWeight="bold">Profile</Link>
               <IconButton>
                  <SearchIcon fontSize="medium" sx={{color:"white"}}/>
               </IconButton>
               <IconButton>
                   <TableRowsIcon Size="large" sx={{color:"white"}}/>
               </IconButton>
               
              { !isAuthenticated &&(
               <Button onClick={() => setLoginOpen(true)}>Login</Button>
              )}
            </Stack>
          </Stack>
        </Box>

        
       </>
    );
}