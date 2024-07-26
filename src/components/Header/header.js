
import React from "react";
import { memo } from "react";
import { Box, Typography,Container,styled,Grid,Paper,Stack,Card,CardContent,CardMedia } from "@mui/material";

import Navbar from "./navbar";  //#3B2F2F dark brown   balck #1B1212
import Recipies from "./recipies";
import WindowSize from "../windowsize";
import Footer from "../Footer/footer";

const BackgroundImage= styled(Box)( ({theme}) =>({
  width: '90%',
  height: '110%',
  opacity: 0.2,
  objectFit: 'cover',
  position: 'absolute',
  zIndex: 1,
  userSelect: 'none',
  pointerEvents: 'none',
 
}));



function Header(){

  return(
    <>
   <Navbar/> 
   
    <WindowSize/>
      
   <Box  backgroundColor="black" height="100%" width="auto" display="flex" flexDirection="column" alignItems="center"  position="relative" sx={{overflow: 'hidden'}} >

      <BackgroundImage component="img" src={require("../../images/black.png")}sx={{  left:{lg:"10%"},transform: 'rotate(180deg)'}}/>
      <BackgroundImage component="img" src={require("../../images/black.png")}sx={{  left:{lg:"10%"}}}/>
    
      <BackgroundImage component="img" src={require("../../images/black.png")}sx={{ right:{lg:"10%"},transform: 'rotate(0deg)'}}/>
      <BackgroundImage component="img" src={require("../../images/black.png")}sx={{ right:{lg:"10%"},transform: 'rotate(180deg)'}}/>

      <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'1.5%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"100%" ,md:"99%",lg:'99%'}, right: {xs:'49%',md:'51%',lg:'53%'},zIndex: 1, transform: 'rotate(310deg)', userSelect: 'none', pointerEvents: 'none'}}/>
      <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'2%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"95%" ,md:"96%",lg:'95%'}, right: {xs:'45%',md:'48%',lg:'51%'},zIndex: 1, transform: 'rotate(340deg)', userSelect: 'none', pointerEvents: 'none'}}/>
      <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'2%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"91%" ,md:"92%",lg:'91%'}, right: {xs:'50%',lg:'53%'},zIndex: 1, transform: 'rotate(195deg)', userSelect: 'none', pointerEvents: 'none'}}/>

      <Container sx={{ zIndex: 2, position: 'relative' }}>
        <Typography variant="h2" align="center" pt={5} color="#FFFFF0" fontWeight="bold">
          خاندانی ذائقے
        </Typography>
        <Typography variant="h6" align="center" pt={3} color="#FFFFF0" fontWeight="bold">
          وہ جگہ جہاں آپ کو خاندانی رسائی کے قدیم وارثی خوراک اور ترائیں ملتی ہیں۔ ہمارے ساتھ سفر کریں اور خاندانی ذائقے کی دنیا کو اپنے گھر تک لے آئیں۔ اپنے کھانے کو یہاں بدلیں، اور خوشی ہر موقع پر خاندانی یادوں کو دوبارہ زندہ کریں۔
        </Typography>
      </Container>


      <Box sx={{ position: 'relative', p:{xs:25,md:30,lg:40}}}>
        <Box component="img" src={require("../../images/gold.png")}sx={{  width:{xs:'60%',lg: '50%'}, height:{xs:'70%',lg: '80%'},  objectFit: 'cover', position: 'absolute',bottom:{ xs:"20%" ,md:"13%",lg:'11%'}, right: {xs:'34%',lg:'40%'},zIndex: 1, userSelect: 'none', pointerEvents: 'none' }}/>
        <Box component="img" src={require("../../images/leaves.png")}sx={{  width:{xs:'60%',lg: '50%'}, height:{xs:'80%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"30%",md:'20%',lg:'30%' }, right: {xs:'0%'},zIndex: 1, userSelect: 'none', pointerEvents: 'none' }}/>
        <Box
          component="img"
          src={require("../../images/q.png")}
          sx={{ width: '100%', height: {xs:'115%',md:'90%',lg:'115%'},objectFit: 'contain', position: 'absolute', bottom: 0, left: 0, zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
      </Box>

    </Box>
   

   </>
  );


}

export default memo(Header);