import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, CircularProgress, Collapse, Container, FormControlLabel, Grid,
  LinearProgress, MenuItem, Popover, Stack, Switch, TextField, Typography,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import KitchenIcon from '@mui/icons-material/Kitchen';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TuneIcon from '@mui/icons-material/Tune';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../components/Feedback';
import IngredientInput from '../components/IngredientInput';
import { RecipeImage } from '../components/RecipeCard';
import EmptyState from '../components/EmptyState';

const STORAGE_KEY = 'ff_pantry';
const readLocal = () => {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeLocal = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
};

const percentColor = (p) => (p === 100 ? 'success' : p >= 70 ? 'warning' : 'default');

export default function Pantry() {
  usePageTitle('What can I cook?');
  const { user } = useAuth();
  const { notify } = useFeedback();
  const [params] = useSearchParams();
  const urlItems = (params.get('items') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

  const [items, setItems] = useState(() => (urlItems.length ? urlItems : readLocal()));
  const [maxMissing, setMaxMissing] = useState(urlItems.length ? 3 : 3);
  const [scope, setScope] = useState(['all', 'public', 'cookbooks', 'saved'].includes(params.get('scope')) ? params.get('scope') : 'all');
  const [diet, setDiet] = useState('');
  const [assumeStaples, setAssumeStaples] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subs, setSubs] = useState({ anchor: null, name: '', list: null, loading: false });
  const fileRef = useRef(null);
  const loadedRemote = useRef(false);

  useEffect(() => {
    api.get('/ai/status').then((r) => setAiEnabled(r.data.enabled)).catch(() => {});
  }, []);

  // Logged-in users get their saved pantry (unless they arrived with ?items=)
  useEffect(() => {
    if (!user || loadedRemote.current) return;
    loadedRemote.current = true;
    if (urlItems.length) return;
    api.get('/me/pantry').then((r) => r.data.pantry.length && setItems((cur) => (cur.length ? cur : r.data.pantry))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Persist pantry locally and, when logged in, on the server.
  useEffect(() => {
    writeLocal(items);
    if (!user) return undefined;
    const t = setTimeout(() => api.put('/me/pantry', { pantry: items }).catch(() => {}), 1200);
    return () => clearTimeout(t);
  }, [items, user]);

  // Debounced search whenever inputs change.
  useEffect(() => {
    if (items.length === 0) {
      setResult(null);
      return undefined;
    }
    let cancelled = false;
    const controller = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      setError('');
      api
        .post('/pantry/match', { ingredients: items, maxMissing, scope, diet: diet || undefined, assumeStaples, limit: 36 }, { signal: controller.signal })
        .then((r) => !cancelled && setResult(r.data))
        .catch((e) => !cancelled && !controller.signal.aborted && setError(errorMessage(e, 'Could not search recipes.')))
        .finally(() => !cancelled && setLoading(false));
    }, 400);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [items, maxMissing, scope, diet, assumeStaples, user]);

  const addItems = useCallback((list) => setItems((cur) => [...new Set([...cur, ...list.map((s) => s.trim().toLowerCase()).filter(Boolean)])]), []);

  const addFromText = async () => {
    if (!text.trim()) return;
    setParsing(true);
    try {
      if (user) {
        const r = await api.post('/ai/parse-ingredients', { text });
        addItems(r.data.ingredients);
      } else {
        addItems(text.split(/,|\n|;|\band\b|&/i));
      }
      setText('');
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setParsing(false);
    }
  };

  const scan = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return notify('That photo is over 10MB.', 'error');
    setScanning(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const r = await api.post('/ai/pantry-from-photo', form);
      addItems(r.data.ingredients);
      notify(r.data.ingredients.length ? `Found ${r.data.ingredients.length} items. Remove any that look wrong.` : 'No ingredients found in that photo.', r.data.ingredients.length ? 'success' : 'info');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setScanning(false);
    }
  };

  const openSubs = async (event, missing) => {
    const anchor = event.currentTarget;
    setSubs({ anchor, name: missing.name, list: missing.substitutes, loading: false });
    if (!missing.substitutes && user && aiEnabled) {
      setSubs({ anchor, name: missing.name, list: null, loading: true });
      try {
        const r = await api.post('/ai/substitute', { ingredient: missing.name });
        setSubs({ anchor, name: missing.name, list: r.data.substitutes, loading: false });
      } catch {
        setSubs({ anchor, name: missing.name, list: [], loading: false });
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <KitchenIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h2" component="h1">What can I cook?</Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Add what is in your kitchen. We rank recipes by how much you already have.</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <IngredientInput value={items} onChange={setItems} autoFocus={!items.length} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }} alignItems={{ sm: 'center' }}>
            <TextField
              size="small"
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFromText())}
              placeholder={user ? 'Or just write it: "2 tomatos n some leftover chicken"' : 'Or paste a list: eggs, rice, onion'}
              inputProps={{ 'aria-label': 'Describe your ingredients' }}
            />
            <Button onClick={addFromText} disabled={!text.trim() || parsing} startIcon={user ? <AutoAwesomeIcon /> : undefined} sx={{ whiteSpace: 'nowrap' }}>
              {parsing ? 'Adding…' : 'Add'}
            </Button>
            {user && aiEnabled && (
              <>
                <Button variant="outlined" startIcon={scanning ? <CircularProgress size={16} /> : <CameraAltIcon />} disabled={scanning} onClick={() => fileRef.current?.click()} sx={{ whiteSpace: 'nowrap' }}>
                  Scan fridge photo
                </Button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={scan} />
              </>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            <Button size="small" startIcon={<TuneIcon />} onClick={() => setShowOptions((s) => !s)}>Filters</Button>
            {items.length > 0 && <Button size="small" color="inherit" onClick={() => setItems([])}>Clear pantry</Button>}
            {!user && <Typography variant="caption" color="text.secondary">Log in to save your pantry, search family cookbooks and scan photos.</Typography>}
          </Stack>

          <Collapse in={showOptions}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth size="small" label="Missing ingredients allowed" value={maxMissing} onChange={(e) => setMaxMissing(Number(e.target.value))}>
                  <MenuItem value={0}>None (ready to cook)</MenuItem>
                  <MenuItem value={1}>Up to 1</MenuItem>
                  <MenuItem value={2}>Up to 2</MenuItem>
                  <MenuItem value={3}>Up to 3</MenuItem>
                  <MenuItem value={5}>Up to 5</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth size="small" label="Search in" value={scope} onChange={(e) => setScope(e.target.value)}>
                  <MenuItem value="all">All recipes{user ? ' + my cookbooks' : ''}</MenuItem>
                  <MenuItem value="public">Public recipes only</MenuItem>
                  {user && <MenuItem value="cookbooks">My family cookbooks</MenuItem>}
                  {user && <MenuItem value="saved">My saved recipes</MenuItem>}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth size="small" label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="vegetarian">Vegetarian</MenuItem>
                  <MenuItem value="vegan">Vegan</MenuItem>
                  <MenuItem value="gluten-free">Gluten-free</MenuItem>
                  <MenuItem value="dairy-free">Dairy-free</MenuItem>
                  <MenuItem value="halal">Halal</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={assumeStaples} onChange={(e) => setAssumeStaples(e.target.checked)} />} label="Assume I have salt, pepper, water and cooking oil" />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!items.length && <EmptyState icon={<KitchenIcon />} title="Your pantry is empty" text="Start with a few things you have, like eggs, rice or onions. You can add more any time." />}

      {result && items.length > 0 && (
        <>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            {result.totalMatches === 0
              ? 'No matches yet.'
              : `${result.totalMatches} recipe${result.totalMatches === 1 ? '' : 's'} match${result.canMakeNow ? `, ${result.canMakeNow} you can make right now` : ''}.`}
          </Typography>
          {result.totalMatches === 0 && !loading && (
            <EmptyState title="Nothing close enough" text="Add a few more ingredients or allow more missing items in Filters." action={<Button variant="contained" onClick={() => { setMaxMissing(5); setShowOptions(true); }}>Allow up to 5 missing</Button>} />
          )}
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {result.items.map((r) => (
              <Grid item xs={12} sm={6} md={4} key={r.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea component={Link} to={`/recipe/${r.id}`}>
                    <Box sx={{ position: 'relative' }}>
                      <RecipeImage src={r.image} alt={r.name} height={160} />
                      <Chip label={`${r.percent}% match`} color={percentColor(r.percent)} sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 700 }} />
                    </Box>
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontSize: '1.05rem', lineHeight: 1.3 }}>{r.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{[r.cuisine, r.category].filter(Boolean).join(' · ')}</Typography>
                      <LinearProgress variant="determinate" value={r.percent} color={percentColor(r.percent) === 'default' ? 'primary' : percentColor(r.percent)} sx={{ mt: 1.5, height: 6, borderRadius: 3 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        You have {r.haveCount} of {r.total} ingredients
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ px: 2, pb: 2, mt: 'auto' }}>
                    {r.missing.length === 0 ? (
                      <Chip icon={<CheckCircleIcon />} color="success" variant="outlined" label="You can make this now" size="small" />
                    ) : (
                      <>
                        <Typography variant="caption" color="text.secondary">Missing (tap for a swap):</Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {r.missing.map((m) => (
                            <Chip key={m.name} label={m.name} size="small" variant="outlined" clickable onClick={(e) => openSubs(e, m)} />
                          ))}
                        </Stack>
                      </>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Popover open={Boolean(subs.anchor)} anchorEl={subs.anchor} onClose={() => setSubs((s) => ({ ...s, anchor: null }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>No {subs.name}? Try:</Typography>
          {subs.loading ? (
            <CircularProgress size={20} />
          ) : subs.list?.length ? (
            subs.list.map((s) => <Typography key={s} variant="body2" sx={{ mb: 0.5 }}>• {s}</Typography>)
          ) : (
            <Typography variant="body2" color="text.secondary">No known swap yet. Check the recipe for alternatives.</Typography>
          )}
        </Box>
      </Popover>
    </Container>
  );
}
