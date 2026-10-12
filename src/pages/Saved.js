import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import RecipeGrid from '../components/RecipeGrid';
import EmptyState from '../components/EmptyState';

export default function Saved() {
  usePageTitle('Saved recipes');
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/me/saved').then((r) => setRecipes(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h2" component="h1" sx={{ mb: 3 }}>Saved recipes</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {recipes?.length === 0 ? (
        <EmptyState icon={<BookmarkBorderIcon />} title="Nothing saved yet" text="Tap Save on any recipe to keep it here." action={<Button component={Link} to="/recipes" variant="contained">Browse recipes</Button>} />
      ) : (
        <RecipeGrid recipes={recipes || []} loading={!recipes && !error} />
      )}
    </Container>
  );
}
