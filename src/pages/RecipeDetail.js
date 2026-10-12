import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Breadcrumbs, Button, Checkbox, Chip, Container, FormControlLabel, Grid, IconButton, LinearProgress, Link as MuiLink,
  Paper, Rating, Skeleton, Stack, Tooltip, Typography,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../components/Feedback';
import Comments from '../components/Comments';
import EmptyState from '../components/EmptyState';
import RecipeGrid from '../components/RecipeGrid';
import { RecipeImage } from '../components/RecipeCard';

const iso = (min) => (min ? `PT${min}M` : undefined);

// Recipe structured data so Google can show rich results (public recipes only).
function useRecipeJsonLd(recipe) {
  useEffect(() => {
    if (!recipe || recipe.visibility !== 'public') return undefined;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.description,
      image: recipe.image ? [recipe.image] : undefined,
      author: { '@type': 'Person', name: recipe.user?.username || 'FamFeast' },
      datePublished: recipe.createdAt,
      prepTime: iso(recipe.prepTime),
      cookTime: iso(recipe.cookTime),
      totalTime: iso(recipe.totalTime),
      recipeYield: recipe.servings ? String(recipe.servings) : undefined,
      recipeCategory: recipe.category,
      recipeCuisine: recipe.cuisine,
      recipeIngredient: recipe.ingredients.map((i) => `${i.amount} ${i.name}`.trim()),
      recipeInstructions: recipe.directions.map((text) => ({ '@type': 'HowToStep', text })),
      aggregateRating: recipe.ratingCount > 0 ? { '@type': 'AggregateRating', ratingValue: recipe.ratingAvg, ratingCount: recipe.ratingCount } : undefined,
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, [recipe]);
}

function Fact({ icon, value, label }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ pr: 3, py: 0.5 }}>
      <Box sx={{ color: 'primary.main', display: 'flex', '& svg': { fontSize: 26 } }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontWeight: 700, lineHeight: 1.15 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </Stack>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify, confirm } = useFeedback();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [checked, setChecked] = useState({});
  const [done, setDone] = useState({});
  const [related, setRelated] = useState([]);

  usePageTitle(recipe?.name || 'Recipe');
  useRecipeJsonLd(recipe);

  useEffect(() => {
    let cancelled = false;
    setRecipe(null);
    setError('');
    setNotFound(false);
    setChecked({});
    setDone({});
    setRelated([]);
    api
      .get(`/recipes/${id}`)
      .then((r) => !cancelled && setRecipe(r.data))
      .catch((e) => {
        if (cancelled) return;
        if (e.response?.status === 404 || e.response?.status === 400) setNotFound(true);
        else setError(errorMessage(e, 'Could not load this recipe.'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  // "More like this": same category (or cuisine), public recipes only
  const relatedCategory = recipe?.visibility === 'public' ? recipe.category : null;
  const relatedCuisine = recipe?.visibility === 'public' ? recipe.cuisine : null;
  useEffect(() => {
    if (!relatedCategory && !relatedCuisine) return undefined;
    let cancelled = false;
    api
      .get('/recipes', { params: { category: relatedCategory || undefined, cuisine: relatedCategory ? undefined : relatedCuisine, sort: 'top', limit: 6 } })
      .then((r) => !cancelled && setRelated(r.data.items.filter((x) => x._id !== id).slice(0, 4)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [relatedCategory, relatedCuisine, id]);

  const isOwner = useMemo(() => Boolean(user && recipe && recipe.user?._id === user.id), [user, recipe]);

  const requireLogin = () => {
    notify('Please log in first.', 'info');
    navigate('/login', { state: { from: `/recipe/${id}` } });
  };

  const toggleSave = async () => {
    if (!user) return requireLogin();
    try {
      const r = recipe.saved ? await api.delete(`/recipes/${id}/save`) : await api.post(`/recipes/${id}/save`);
      setRecipe((x) => ({ ...x, saved: r.data.saved, saveCount: r.data.saveCount }));
      notify(r.data.saved ? 'Saved to your recipes' : 'Removed from saved', 'success');
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const rate = async (_, value) => {
    if (!user) return requireLogin();
    if (!value) return;
    try {
      const r = await api.post(`/recipes/${id}/rate`, { value });
      setRecipe((x) => ({ ...x, ...r.data }));
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: recipe.name, url });
      else {
        await navigator.clipboard.writeText(url);
        notify('Link copied to clipboard');
      }
    } catch {
      /* user cancelled */
    }
  };

  const remove = async () => {
    if (!(await confirm({ title: 'Delete this recipe?', text: 'This also removes its comments and ratings. It cannot be undone.', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await api.delete(`/recipes/${id}`);
      notify('Recipe deleted');
      navigate(`/profile/${user.id}`);
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  if (notFound) {
    return (
      <Container maxWidth="sm">
        <EmptyState title="Recipe not found" text="It may have been removed, or it is private to a family cookbook." action={<Button component={Link} to="/recipes" variant="contained">Browse recipes</Button>} />
      </Container>
    );
  }
  if (error) return <Container sx={{ py: 6 }}><Alert severity="error">{error}</Alert></Container>;
  if (!recipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
        <Skeleton width="60%" height={50} sx={{ mt: 2 }} />
        <Skeleton width="40%" />
      </Container>
    );
  }

  const stepsDone = Object.values(done).filter(Boolean).length;
  const ingDone = Object.values(checked).filter(Boolean).length;
  const authorName = recipe.user?.username;
  const glass = { bgcolor: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)' };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2, color: 'text.secondary', fontSize: 14 }} aria-label="Breadcrumb">
        <MuiLink component={Link} to="/recipes" color="inherit" underline="hover">Recipes</MuiLink>
        {recipe.category && <MuiLink component={Link} to={`/recipes?category=${encodeURIComponent(recipe.category)}`} color="inherit" underline="hover">{recipe.category}</MuiLink>}
        <Typography color="text.primary" sx={{ fontSize: 14, maxWidth: 260 }} noWrap>{recipe.name}</Typography>
      </Breadcrumbs>

      {/* Hero */}
      <Box sx={{ position: 'relative', borderRadius: { xs: 3, md: 5 }, overflow: 'hidden', bgcolor: '#140d0d' }}>
        <RecipeImage src={recipe.image} alt={recipe.name} height={{ xs: 300, sm: 400, md: 480 }} full sizes="(min-width:1200px) 1200px, 100vw" />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 72%)' }} />
        <IconButton
          onClick={toggleSave}
          aria-label={recipe.saved ? 'Remove from saved' : 'Save recipe'}
          sx={{ position: 'absolute', top: 14, right: 14, bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
        >
          {recipe.saved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
        </IconButton>
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: { xs: 2.5, md: 5 } }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
            {recipe.visibility === 'cookbook' && <Chip icon={<LockIcon />} color="secondary" size="small" label={`Family only${recipe.cookbook?.name ? ` · ${recipe.cookbook.name}` : ''}`} />}
            {recipe.cuisine && <Chip component={Link} clickable to={`/recipes?cuisine=${encodeURIComponent(recipe.cuisine)}`} size="small" label={recipe.cuisine} sx={glass} />}
            {recipe.diets?.map((d) => <Chip key={d} size="small" label={d} color="primary" />)}
          </Stack>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3.3rem' }, textShadow: '0 2px 18px rgba(0,0,0,0.6)' }}>
            {recipe.name}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
            {authorName && (
              <Stack direction="row" spacing={1} alignItems="center" component={Link} to={`/profile/${recipe.user._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', color: '#000', fontSize: 14, fontWeight: 700 }}>{authorName[0].toUpperCase()}</Avatar>
                <Typography sx={{ fontWeight: 700 }}>{authorName}</Typography>
              </Stack>
            )}
            <Typography variant="body2" color="text.secondary">
              · {new Date(recipe.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Rating + actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Rating value={recipe.myRating || recipe.ratingAvg || 0} precision={recipe.myRating ? 1 : 0.5} onChange={rate} readOnly={isOwner} size="large" aria-label="Rate this recipe" />
          <Typography color="text.secondary">
            {recipe.ratingCount ? `${recipe.ratingAvg} · ${recipe.ratingCount} rating${recipe.ratingCount === 1 ? '' : 's'}` : isOwner ? 'No ratings yet' : 'Be the first to rate'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button variant={recipe.saved ? 'contained' : 'outlined'} startIcon={recipe.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />} onClick={toggleSave} sx={{ mr: 1 }}>
            {recipe.saved ? 'Saved' : 'Save'}
          </Button>
          <Tooltip title="Share"><IconButton onClick={share} aria-label="Share recipe"><ShareIcon /></IconButton></Tooltip>
          <Tooltip title="Print"><IconButton onClick={() => window.print()} aria-label="Print recipe"><PrintIcon /></IconButton></Tooltip>
          {isOwner && (
            <>
              <Button component={Link} to={`/recipes/${id}/edit`} startIcon={<EditIcon />} color="inherit">Edit</Button>
              <Button onClick={remove} startIcon={<DeleteIcon />} color="error">Delete</Button>
            </>
          )}
        </Stack>
      </Stack>

      <Typography sx={{ mt: 2.5, maxWidth: 820, fontSize: '1.08rem', lineHeight: 1.75 }}>{recipe.description}</Typography>

      {/* Quick facts, one calm row */}
      <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ mt: 3, py: 2, px: 3, borderRadius: 4, bgcolor: 'background.paper' }}>
        {recipe.totalTime && <Fact icon={<ScheduleIcon />} value={`${recipe.totalTime} min`} label="Total time" />}
        {recipe.servings && <Fact icon={<PeopleIcon />} value={recipe.servings} label="Servings" />}
        {recipe.difficulty && <Fact icon={<SignalCellularAltIcon />} value={<span style={{ textTransform: 'capitalize' }}>{recipe.difficulty}</span>} label="Difficulty" />}
        <Fact icon={<ListAltIcon />} value={recipe.ingredients.length} label="Ingredients" />
        <Fact icon={<FormatListNumberedIcon />} value={recipe.directions.length} label="Steps" />
        <Fact icon={<FavoriteBorderIcon />} value={recipe.saveCount || 0} label="Saved by" />
      </Stack>

      {recipe.story && (
        <Paper sx={{ mt: 3, p: 3, borderRadius: 4 }}>
          <Typography variant="overline" color="secondary">Family story</Typography>
          <Typography sx={{ fontStyle: 'italic', fontSize: '1.05rem' }}>{recipe.story}</Typography>
        </Paper>
      )}

      {/* Ingredients + method */}
      <Grid container spacing={{ xs: 3, md: 5 }} sx={{ mt: 1 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, position: { md: 'sticky' }, top: { md: 16 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="h4" component="h2">Ingredients</Typography>
              <Typography variant="caption" color="text.secondary">{ingDone}/{recipe.ingredients.length} ready</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={(ingDone / recipe.ingredients.length) * 100} sx={{ my: 1.5, height: 5, borderRadius: 3 }} />
            <Stack>
              {recipe.ingredients.map((ing, i) => (
                <FormControlLabel
                  key={i}
                  control={<Checkbox checked={Boolean(checked[i])} onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))} />}
                  label={
                    <span style={{ textDecoration: checked[i] ? 'line-through' : 'none', opacity: checked[i] ? 0.5 : 1 }}>
                      {ing.amount && <strong style={{ color: '#9DBE7A' }}>{ing.amount} </strong>}
                      {ing.name}
                    </span>
                  }
                  sx={{ m: 0, py: 0.25 }}
                />
              ))}
            </Stack>
            <Button component={Link} to={`/pantry?items=${encodeURIComponent(recipe.ingredients.map((i) => i.name.toLowerCase()).slice(0, 8).join(','))}`} size="small" sx={{ mt: 1.5 }}>
              Find recipes with these ingredients
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
            <Typography variant="h4" component="h2">Method</Typography>
            <Typography variant="caption" color="text.secondary">{stepsDone}/{recipe.directions.length} steps done · tap a step to tick it off</Typography>
          </Stack>
          <Stack spacing={1.5}>
            {recipe.directions.map((step, i) => (
              <Paper
                key={i}
                onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                role="checkbox"
                aria-checked={Boolean(done[i])}
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), setDone((d) => ({ ...d, [i]: !d[i] })))}
                sx={{ p: 2, display: 'flex', gap: 2, borderRadius: 3, cursor: 'pointer', opacity: done[i] ? 0.5 : 1, transition: 'opacity .2s' }}
              >
                <Box sx={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, bgcolor: done[i] ? 'success.main' : 'primary.main', color: '#000' }}>
                  {done[i] ? '✓' : i + 1}
                </Box>
                <Typography sx={{ pt: 0.4, lineHeight: 1.7 }}>{step}</Typography>
              </Paper>
            ))}
          </Stack>
          {recipe.source?.url && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
              Original recipe: <MuiLink href={recipe.source.url} target="_blank" rel="noopener noreferrer">{recipe.source.name || recipe.source.url}</MuiLink>
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Comments */}
      <Box sx={{ mt: { xs: 7, md: 10 }, maxWidth: 860 }}>
        <Comments recipeId={id} recipeOwnerId={recipe.user?._id} />
      </Box>

      {/* More like this */}
      {related.length > 0 && (
        <Box sx={{ mt: { xs: 7, md: 10 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 2 }}>More like this</Typography>
          <RecipeGrid recipes={related} />
        </Box>
      )}
    </Container>
  );
}
