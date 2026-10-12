import React from 'react';
import { Grid } from '@mui/material';
import RecipeCard, { RecipeCardSkeleton } from './RecipeCard';

export default function RecipeGrid({ recipes, loading, skeletons = 8 }) {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <RecipeCardSkeleton />
            </Grid>
          ))
        : recipes.map((r) => (
            <Grid item xs={6} sm={4} md={3} key={r._id || r.id}>
              <RecipeCard recipe={r} />
            </Grid>
          ))}
    </Grid>
  );
}
