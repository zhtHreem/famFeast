import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmptyState({ icon, title, text, action }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      {icon && <Box sx={{ color: 'primary.main', mb: 1, '& svg': { fontSize: 56 } }}>{icon}</Box>}
      <Typography variant="h5" gutterBottom>{title}</Typography>
      {text && <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto' }}>{text}</Typography>}
      {action}
    </Box>
  );
}
