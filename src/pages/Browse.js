import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, Container, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import RecipeGrid from '../components/RecipeGrid';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const DIET_LABELS = { vegetarian: 'Vegetarian', vegan: 'Vegan', 'gluten-free': 'Gluten-free', 'dairy-free': 'Dairy-free', halal: 'Halal' };

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const cuisine = params.get('cuisine') || '';
  const diet = params.get('diet') || '';
  const sort = params.get('sort') || 'new';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  usePageTitle(q ? `Search: ${q}` : 'Recipes');

  const [facets, setFacets] = useState({ categories: [], cuisines: [], diets: [] });
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    api.get('/recipes/facets').then((r) => setFacets(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/recipes', { params: { q, category, cuisine, diet, sort, page, limit: 12 } })
      .then((r) => !cancelled && setData(r.data))
      .catch((e) => !cancelled && setError(errorMessage(e, 'Could not load recipes.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, category, cuisine, diet, sort, page, attempt]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const hasFilters = q || category || cuisine || diet;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h2" component="h1" sx={{ mb: 0.5 }}>{q ? `Results for “${q}”` : 'All recipes'}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>{loading ? 'Loading…' : `${data.total} recipe${data.total === 1 ? '' : 's'}`}</Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField select size="small" label="Category" value={category} onChange={(e) => update({ category: e.target.value })} sx={{ minWidth: 170 }}>
          <MenuItem value="">All categories</MenuItem>
          {facets.categories.map((c) => <MenuItem key={c.name} value={c.name}>{c.name} ({c.count})</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Cuisine" value={cuisine} onChange={(e) => update({ cuisine: e.target.value })} sx={{ minWidth: 170 }}>
          <MenuItem value="">All cuisines</MenuItem>
          {facets.cuisines.map((c) => <MenuItem key={c.name} value={c.name}>{c.name} ({c.count})</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Sort by" value={sort} onChange={(e) => update({ sort: e.target.value === 'new' ? '' : e.target.value })} sx={{ minWidth: 150 }}>
          <MenuItem value="new">Newest</MenuItem>
          <MenuItem value="top">Top rated</MenuItem>
          <MenuItem value="saved">Most saved</MenuItem>
          <MenuItem value="name">A–Z</MenuItem>
        </TextField>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }} alignItems="center">
        {facets.diets.map((d) => (
          <Chip key={d} label={DIET_LABELS[d] || d} clickable color={diet === d ? 'primary' : 'default'} variant={diet === d ? 'filled' : 'outlined'} onClick={() => update({ diet: diet === d ? '' : d })} sx={{ flexShrink: 0 }} />
        ))}
        {hasFilters && <Button size="small" onClick={() => setParams({})} sx={{ flexShrink: 0 }}>Clear all</Button>}
      </Stack>


      {error ? (
        <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />
      ) : !loading && data.items.length === 0 ? (
        <EmptyState icon={<SearchOffIcon />} title="No recipes found" text="Try fewer filters or a different word. You can also search by ingredient." action={<Button variant="contained" onClick={() => setParams({})}>Show all recipes</Button>} />
      ) : (
        <RecipeGrid recipes={data.items} loading={loading} skeletons={12} />
      )}

      {data.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={data.pages} page={page} color="primary" siblingCount={0} onChange={(_, p) => { update({ page: String(p) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </Box>
      )}
    </Container>
  );
}
