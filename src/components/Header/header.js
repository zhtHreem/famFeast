import React from 'react';
import { Box, Typography, Container, styled } from '@mui/material';
import { keyframes } from '@emotion/react';
import { LEAF_CREAM, LEAF_GOLD, LEAF_OLIVE, LEAF_RUST } from '../leafImages';

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

const Header = () => {
  return (
    <Box sx={{ backgroundColor: 'black', position: 'relative', overflow: 'hidden', width: '100%', pb: { xs: 2, md: 4 } }}>
      {/* Falling leaves (kept light so the page stays calm) */}
      <LeafContainer>
        <Leaf left={18} delay="-2s">
          <img src={LEAF_RUST} height="70px" width="70px" alt="" />
        </Leaf>
        <Leaf left={72} delay="-6s">
          <img src={LEAF_GOLD} height="70px" width="70px" alt="" />
        </Leaf>
        <Leaf left={48} delay="-9s">
          <img src={LEAF_OLIVE} height="60px" width="60px" alt="" />
        </Leaf>
        <Leaf left={88} delay="-12s">
          <img src={LEAF_CREAM} height="60px" width="60px" alt="" />
        </Leaf>
      </LeafContainer>

      {/* Main Header Content */}
      <Box sx={{ width: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <Container sx={{ position: 'relative', zIndex: 3 }}>
          <Typography variant="h2" component="h1" align="center" pt={{ xs: 4, md: 6 }} color="#FFFFF0" fontWeight="bold">
            Family Flavours
          </Typography>
          <Typography variant="h6" align="center" pt={2} color="#FFFFF0" sx={{ maxWidth: 620, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
            Where treasured family recipes live on. Cook with what you have and bring the taste of home to every table.
          </Typography>
        </Container>
        <Box sx={{ position: 'relative', p: { xs: 25, md: 30, lg: 40 } }}>
          <Box component="img" alt="" src={require("../../images/gold.webp")} sx={{ width: { xs: '60%', lg: '50%' }, height: { xs: '70%', lg: '80%' }, objectFit: 'cover', position: 'absolute', bottom: { xs: "20%", md: "13%", lg: '11%' }, right: { xs: '34%', lg: '40%' }, zIndex: 2, userSelect: 'none', pointerEvents: 'none' }} />
          <Box component="img" alt="" src={require("../../images/leaves.webp")} sx={{ width: { xs: '60%', lg: '50%' }, height: { xs: '80%' }, objectFit: 'contain', position: 'absolute', bottom: { xs: "30%", md: '20%', lg: '30%' }, right: { xs: '0%' }, zIndex: 2, userSelect: 'none', pointerEvents: 'none' }} />
          <Box component="img" alt="" src={require("../../images/food (1).webp")} sx={{ width: '100%', height: { xs: '115%', md: '90%', lg: '115%' }, objectFit: 'contain', position: 'absolute', bottom: 0, left: 0, zIndex: 2, userSelect: 'none', pointerEvents: 'none' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
