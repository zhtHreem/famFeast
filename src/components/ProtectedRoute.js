import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Wrap private routes: waits for the stored session check, then redirects to /login (remembering the target).
export default function ProtectedRoute() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
