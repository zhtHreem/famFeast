import React from 'react';
import { Box, Typography, Container, styled } from '@mui/material';
import { keyframes } from '@emotion/react';

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

const Leaves= () => {
  return (
    <Box
      sx={{
        backgroundColor: 'black',
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <Container sx={{ zIndex: 2, position: 'relative', color: '#fff', pt: 5 }}>
         
          {/* Header logic  */}
      </Container>

      {/* Falling leaves animation */}
      <LeafContainer sx={{ zIndex: 0 }}>
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
          <img src="http://cdn.clipart-db.ru/rastr/autumn_leaves_025.png" height="75px" width="75px" alt="leaf" />
        </Leaf>
      </LeafContainer>
    </Box>
  );
};

export default Leaves;
