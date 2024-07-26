import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';

// Custom hook to get window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Component to display window size
const WindowSize = () => {
  const { width, height } = useWindowSize();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        padding: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        borderRadius: '4px',
        zIndex: 1000
      }}
    >
      <Typography variant="body2">Width: {width}px</Typography>
      <Typography variant="body2">Height: {height}px</Typography>
    </Box>
  );
};

export default WindowSize;
