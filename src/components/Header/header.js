import React from 'react';
import { Box, Typography, Container, styled } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useLogin } from '../Login/logincontext';
import Login from '../Login/login';

// Define the falling animation keyframes
const fall = keyframes`
  0% {
    opacity: 1;
    top: -10%;
    transform: translateX(20px) rotate(0deg);
  }
  20% {
    opacity: 0.8;
    transform: translateX(-20px) rotate(45deg);
  }
  40% {
    transform: translateX(-20px) rotate(90deg);
  }
  60% {
    transform: translateX(-20px) rotate(135deg);
  }
  80% {
    transform: translateX(-20px) rotate(180deg);
  }
  100% {
    top: 110%;
    transform: translateX(-20px) rotate(225deg);
  }
`;

// Styled leaf container for animation
const LeafContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
}));

// Individual leaf styled for each animation
const Leaf = styled(Box)(({ delay, left }) => ({
  position: 'absolute',
  left: `${left}%`,
  animation: `${fall} 15s linear infinite`,
  animationDelay: delay,
}));

// Background image style
const BackgroundImage = styled(Box)(({ theme }) => ({
  width: '90%',
  height: '110%',
  opacity: 0.2,
  objectFit: 'cover',
  position: 'absolute',
  zIndex: 1,
  userSelect: 'none',
  pointerEvents: 'none',
}));

const Header = () => {
  const { isLoginOpen, setLoginOpen } = useLogin();

  return (
    <Box sx={{backgroundColor:"black", position: 'relative', overflow: 'hidden', height: '100vh', width: '100%' }}>
      {isLoginOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
          <Login setLogin={setLoginOpen} />
        </Box>
      )}

     
      {/* Falling Leaves Animation */}
      <LeafContainer>
        <Leaf left={20} delay="-2s">
          <img src="http://www.pngmart.com/files/1/Fall-Autumn-Leaves-Transparent-PNG.png" height="75px" width="75px" alt="leaf" />
        </Leaf>
        <Leaf left={70} delay="-4s">
          <img src="http://www.pngmart.com/files/1/Autumn-Fall-Leaves-Pictures-Collage-PNG.png" height="75px" width="75px" alt="leaf" />
        </Leaf>
        <Leaf left={10} delay="-7s">
          <img src="http://www.pngmart.com/files/1/Autumn-Fall-Leaves-Clip-Art-PNG.png" height="75px" width="75px" alt="leaf" />
        </Leaf>
        <Leaf left={50} delay="-5s">
          <img src="http://www.pngmart.com/files/1/Green-Leaves-PNG-File.png" height="75px" width="75px" alt="leaf" />
        </Leaf>
        <Leaf left={85} delay="-5s">
          <img src="http://www.pngmart.com/files/1/Transparent-Autumn-Leaves-Falling-PNG.png" height="75px" width="75px" alt="leaf" />
        </Leaf>
        <Leaf left={15} delay="-10s">
          <img src="http://www.pngmart.com/files/1/Realistic-Autumn-Fall-Leaves-PNG.png" height="75px" width="75px" alt="leaf" />
        </Leaf>
        <Leaf left={90} delay="-4s">
          <img src="http://www.pngmart.com/files/1/Green-Leaves-PNG-File.png" height="25px" width="25px" alt="leaf" />
        </Leaf>
      </LeafContainer>

      {/* Main Header Content */}
      <Box sx={{ height: '100%', width: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'1.5%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"100%" ,md:"99%",lg:'99%'}, right: {xs:'49%',md:'51%',lg:'53%'},zIndex: 1, transform: 'rotate(310deg)', userSelect: 'none', pointerEvents: 'none'}}/>
      <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'2%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"95%" ,md:"96%",lg:'95%'}, right: {xs:'45%',md:'48%',lg:'51%'},zIndex: 1, transform: 'rotate(340deg)', userSelect: 'none', pointerEvents: 'none'}}/>
      <Box component="img" src={require("../../images/l1.png")}sx={{  width:{xs:'90%',lg: '90%'}, height:{xs:'2%'},  objectFit: 'contain', position: 'absolute',bottom:{ xs:"91%" ,md:"92%",lg:'91%'}, right: {xs:'50%',lg:'53%'},zIndex: 1, transform: 'rotate(195deg)', userSelect: 'none', pointerEvents: 'none'}}/>
        <Container sx={{ position: 'relative', zIndex: 3 }}>
          <Typography variant="h2" align="center" pt={5} color="#FFFFF0" fontWeight="bold">
            خاندانی ذائقے
          </Typography>
          <Typography variant="h6" align="center" pt={3} color="#FFFFF0" fontWeight="bold">
            وہ جگہ جہاں آپ کو خاندانی رسائی کے قدیم وارثی خوراک اور ترائیں ملتی ہیں۔ ہمارے ساتھ سفر کریں اور خاندانی ذائقے کی دنیا کو اپنے گھر تک لے آئیں۔ اپنے کھانے کو یہاں بدلیں، اور خوشی ہر موقع پر خاندانی یادوں کو دوبارہ زندہ کریں۔
          </Typography>
        </Container>
        <Box sx={{ position: 'relative', p: { xs: 25, md: 30, lg: 40 } }}>
          <Box component="img" src={require("../../images/gold.png")} sx={{ width: { xs: '60%', lg: '50%' }, height: { xs: '70%', lg: '80%' }, objectFit: 'cover', position: 'absolute', bottom: { xs: "20%", md: "13%", lg: '11%' }, right: { xs: '34%', lg: '40%' }, zIndex: 2, userSelect: 'none', pointerEvents: 'none' }} />
          <Box component="img" src={require("../../images/leaves.png")} sx={{ width: { xs: '60%', lg: '50%' }, height: { xs: '80%' }, objectFit: 'contain', position: 'absolute', bottom: { xs: "30%", md: '20%', lg: '30%' }, right: { xs: '0%' }, zIndex: 2, userSelect: 'none', pointerEvents: 'none' }} />
          <Box component="img" src={require("../../images/q.png")} sx={{ width: '100%', height: { xs: '115%', md: '90%', lg: '115%' }, objectFit: 'contain', position: 'absolute', bottom: 0, left: 0, zIndex: 2, userSelect: 'none', pointerEvents: 'none' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
