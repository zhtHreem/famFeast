import React from 'react';
import { Box, Container, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// No border or panel: it simply continues the page.
export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: { xs: 8, md: 12 }, pt: 4, pb: 5 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Logo />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 340 }}>
              Cook what you have. Share what you love.
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            <MuiLink component={Link} to="/recipes" color="text.secondary" underline="hover">Recipes</MuiLink>
            <MuiLink component={Link} to="/pantry" color="text.secondary" underline="hover">What can I cook?</MuiLink>
            <MuiLink component={Link} to="/cookbooks" color="text.secondary" underline="hover">Family cookbooks</MuiLink>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, opacity: 0.7 }}>
          © {new Date().getFullYear()} FamFeast. Starter recipes courtesy of{' '}
          <MuiLink href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer" color="inherit">TheMealDB</MuiLink>.
        </Typography>
      </Container>
    </Box>
  );
}
