import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ACCENT } from '../theme';

// Wordmark: "Fam" over F E A S T, with the accent-coloured E from the original design.
export default function Logo({ size = 'md' }) {
  const big = size === 'lg';
  return (
    <Box component={Link} to="/" aria-label="FamFeast home" sx={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
      <Typography component="span" sx={{ fontSize: big ? 16 : 12, color: 'rgba(255,255,255,0.65)', fontWeight: 700, letterSpacing: 1, ml: 0.3 }}>
        Fam
      </Typography>
      <Typography component="span" sx={{ fontSize: big ? 38 : 28, fontWeight: 700, letterSpacing: 2, mt: -0.4 }}>
        F<span style={{ fontFamily: 'Blaka, cursive', color: ACCENT }}>E</span>AST
      </Typography>
    </Box>
  );
}
