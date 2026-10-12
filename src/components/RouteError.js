import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link, useRouteError } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Last line of defence: if any page crashes while rendering, show this instead of a blank screen.
export default function RouteError() {
  const error = useRouteError();
  if (process.env.NODE_ENV !== 'production') console.error(error);
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#000' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" sx={{ mt: 1 }}>Something went wrong</Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, mb: 4 }}>
          This page hit an unexpected problem. Reloading usually fixes it, and your data is safe.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button variant="contained" onClick={() => window.location.reload()}>Reload page</Button>
          <Button component={Link} to="/" color="inherit" onClick={() => setTimeout(() => window.location.assign('/'), 0)}>Go home</Button>
        </Stack>
      </Container>
    </Box>
  );
}
