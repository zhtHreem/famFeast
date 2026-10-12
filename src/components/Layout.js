import React from 'react';
import { Box } from '@mui/material';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Header/navbar';
import Footer from './Footer';
import Backdrop from './Backdrop';

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Backdrop />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
      </Box>
      <Box component="main" sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </Box>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Footer />
      </Box>
      <ScrollRestoration />
    </Box>
  );
}
