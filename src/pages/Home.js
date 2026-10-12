import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../auth/AuthContext';
import IngredientInput from '../components/IngredientInput';
import RecipeGrid from '../components/RecipeGrid';
import Header from '../components/Header/header';
import { ACCENT } from '../theme';

export default function Home() {
  usePageTitle('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/recipes', { params: { limit: 8, sort: 'new' } }), api.get('/recipes/facets')])
      .then(([r, f]) => {
        setRecipes(r.data.items);
        setCategories(f.data.categories.slice(0, 12));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const findRecipes = (e) => {
    e.preventDefault();
    navigate(items.length ? `/pantry?items=${encodeURIComponent(items.join(','))}` : '/pantry');
  };

  return (
    <>
      <Header />

      {/* Pantry search */}
      <Container maxWidth="sm" sx={{ textAlign: 'center', pt: { xs: 1, md: 2 } }}>
        <Typography variant="h3" component="h2">
          What's in your <Box component="span" sx={{ color: ACCENT }}>kitchen</Box>?
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Add a few ingredients and we'll show what you can cook right now.
        </Typography>
        <Box component="form" onSubmit={findRecipes}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
              <IngredientInput value={items} onChange={setItems} label="Ingredients you have" placeholder="eggs, rice, onion…" />
            </Box>
            <Button type="submit" variant="contained" size="large" sx={{ minHeight: 56, whiteSpace: 'nowrap' }}>
              Find recipes
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Recipes */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 11 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
          <Typography variant="h3" component="h2">Fresh from the kitchen</Typography>
          <Button component={Link} to="/recipes">See all</Button>
        </Stack>
        {categories.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 2, mb: 1, '&::-webkit-scrollbar': { height: 0 } }}>
            {categories.map((c) => (
              <Chip key={c.name} component={Link} to={`/recipes?category=${encodeURIComponent(c.name)}`} clickable label={c.name} sx={{ flexShrink: 0, backgroundColor: '#1B1212' }} />
            ))}
          </Stack>
        )}
        <RecipeGrid recipes={recipes} loading={loading} />
      </Container>

      {/* Family cookbook invitation: plain text on the same canvas */}
      <Container maxWidth="sm" sx={{ mt: { xs: 9, md: 12 }, textAlign: 'center' }}>
        <Typography variant="h3" component="h2">Keep the family's recipes together</Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, mb: 3 }}>
          Start a private cookbook, share the invite code, and let everyone add the dishes that taste like home.
        </Typography>
        <Button component={Link} to={user ? '/cookbooks' : '/register'} variant="contained" size="large">
          {user ? 'Open my cookbooks' : 'Create a free account'}
        </Button>
      </Container>
    </>
  );
}
