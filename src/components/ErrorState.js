import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import RefreshIcon from '@mui/icons-material/Refresh';

// Shown when a request fails, instead of an empty page that looks like "no data".
export default function ErrorState({ message, onRetry, compact = false, title = "Couldn't load this" }) {
  return (
    <Box role="alert" sx={{ textAlign: 'center', py: compact ? 4 : 8, px: 2 }}>
      <CloudOffIcon sx={{ fontSize: compact ? 36 : 52, color: 'text.secondary', mb: 1 }} />
      <Typography variant={compact ? 'h6' : 'h5'} gutterBottom>{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: onRetry ? 3 : 0 }}>
        {message || 'Something went wrong while talking to the server.'}
      </Typography>
      {onRetry && (
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </Box>
  );
}
