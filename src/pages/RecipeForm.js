import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress, Container, FormControlLabel, Grid, IconButton, MenuItem,
  Stack, Switch, TextField, Typography,
} from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../components/Feedback';

const DIETS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'];
const MAX_IMAGE = 10 * 1024 * 1024;
const emptyIngredient = () => ({ name: '', amount: '' });

export default function RecipeForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  usePageTitle(editing ? 'Edit recipe' : 'Add a recipe');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { notify } = useFeedback();

  const [form, setForm] = useState({ name: '', description: '', prepTime: '', cookTime: '', servings: '', difficulty: '', category: '', cuisine: '', story: '' });
  const [ingredients, setIngredients] = useState([emptyIngredient(), emptyIngredient(), emptyIngredient()]);
  const [directions, setDirections] = useState(['', '']);
  const [diets, setDiets] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [cookbooks, setCookbooks] = useState([]);
  const [cookbook, setCookbook] = useState(params.get('cookbook') || '');
  const [publish, setPublish] = useState(false);
  const [facets, setFacets] = useState({ categories: [], cuisines: [] });
  const [aiEnabled, setAiEnabled] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const photoRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    api.get('/cookbooks').then((r) => setCookbooks(r.data)).catch(() => {});
    api.get('/recipes/facets').then((r) => setFacets(r.data)).catch(() => {});
    api.get('/ai/status').then((r) => setAiEnabled(r.data.enabled)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/recipes/${id}`)
      .then((r) => {
        const x = r.data;
        if (x.user?._id !== user.id) {
          notify('You can only edit your own recipes.', 'error');
          return navigate(`/recipe/${id}`, { replace: true });
        }
        setForm({
          name: x.name, description: x.description, prepTime: x.prepTime ?? '', cookTime: x.cookTime ?? '', servings: x.servings ?? '',
          difficulty: x.difficulty || '', category: x.category || '', cuisine: x.cuisine || '', story: x.story || '',
        });
        setIngredients(x.ingredients.map((i) => ({ name: i.name, amount: i.amount || '' })));
        setDirections(x.directions);
        setDiets(x.diets || []);
        setPreview(x.image || '');
      })
      .catch((e) => setError(errorMessage(e, 'Could not load the recipe.')))
      .finally(() => setLoading(false));
  }, [editing, id, user.id, navigate, notify]);

  useEffect(() => () => preview.startsWith('blob:') && URL.revokeObjectURL(preview), [preview]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setIng = (i, key, v) => setIngredients((list) => list.map((x, j) => (j === i ? { ...x, [key]: v } : x)));
  const setStep = (i, v) => setDirections((list) => list.map((x, j) => (j === i ? v : x)));

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return notify('Please choose a PNG, JPG, WEBP or GIF image.', 'error');
    if (file.size > MAX_IMAGE) return notify('Image must be under 10MB.', 'error');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const importFromPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMAGE) return notify('Image must be under 10MB.', 'error');
    setImporting(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const { data } = await api.post('/ai/recipe-from-photo', body);
      setForm((f) => ({
        ...f, name: data.name || f.name, description: data.description || f.description,
        servings: data.servings ?? f.servings, prepTime: data.prepTime ?? f.prepTime, cookTime: data.cookTime ?? f.cookTime,
      }));
      if (data.ingredients.length) setIngredients(data.ingredients);
      if (data.directions.length) setDirections(data.directions);
      notify('Recipe imported. Please check it carefully before saving.', 'info');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setImporting(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanIngredients = ingredients.map((i) => ({ name: i.name.trim(), amount: i.amount.trim() })).filter((i) => i.name);
    const cleanSteps = directions.map((d) => d.trim()).filter(Boolean);
    if (form.name.trim().length < 2) return setError('Give your recipe a name.');
    if (!form.description.trim()) return setError('Add a short description.');
    if (!cleanIngredients.length) return setError('Add at least one ingredient.');
    if (!cleanSteps.length) return setError('Add at least one step.');

    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== '' && body.append(k, v));
    body.append('ingredients', JSON.stringify(cleanIngredients));
    body.append('directions', JSON.stringify(cleanSteps));
    body.append('diets', JSON.stringify(diets));
    if (image) body.append('image', image);
    if (!editing && cookbook) {
      body.append('cookbook', cookbook);
      body.append('publishToSite', String(publish));
    }

    setSaving(true);
    try {
      const { data } = editing ? await api.put(`/recipes/${id}`, body) : await api.post('/recipes', body);
      notify(editing ? 'Recipe updated' : 'Recipe published');
      navigate(`/recipe/${data._id}`);
    } catch (err) {
      setError(errorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h2" component="h1">{editing ? 'Edit recipe' : 'Add a recipe'}</Typography>
        {!editing && aiEnabled && (
          <>
            <Button variant="outlined" startIcon={importing ? <CircularProgress size={16} /> : <AutoAwesomeIcon />} disabled={importing} onClick={() => importRef.current?.click()}>
              Import from photo
            </Button>
            <input ref={importRef} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={importFromPhoto} />
          </>
        )}
      </Stack>

      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <TextField label="Recipe name" value={form.name} onChange={set('name')} required inputProps={{ maxLength: 140 }} />
                <TextField label="Description" value={form.description} onChange={set('description')} required multiline minRows={2} inputProps={{ maxLength: 2000 }} helperText="One or two sentences about the dish" />
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Photo</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      onClick={() => photoRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label="Choose photo"
                      onKeyDown={(e) => e.key === 'Enter' && photoRef.current?.click()}
                      sx={{ width: 140, height: 100, borderRadius: 2, border: '2px dashed', borderColor: 'divider', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden', '&:hover': { borderColor: 'primary.main' } }}
                    >
                      {preview ? <img src={preview} alt="Recipe preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <AddPhotoAlternateIcon color="primary" sx={{ fontSize: 36 }} />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">PNG, JPG, WEBP or GIF, up to 10MB.<br />A good photo gets many more saves.</Typography>
                  </Stack>
                  <input ref={photoRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={pickImage} />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><TextField label="Prep (min)" type="number" fullWidth value={form.prepTime} onChange={set('prepTime')} inputProps={{ min: 0, max: 10000 }} /></Grid>
                <Grid item xs={6} sm={3}><TextField label="Cook (min)" type="number" fullWidth value={form.cookTime} onChange={set('cookTime')} inputProps={{ min: 0, max: 10000 }} /></Grid>
                <Grid item xs={6} sm={3}><TextField label="Servings" type="number" fullWidth value={form.servings} onChange={set('servings')} inputProps={{ min: 1, max: 1000 }} /></Grid>
                <Grid item xs={6} sm={3}>
                  <TextField select label="Difficulty" fullWidth value={form.difficulty} onChange={set('difficulty')}>
                    <MenuItem value="">Not set</MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete freeSolo options={facets.categories.map((c) => c.name)} inputValue={form.category} onInputChange={(_, v) => setForm((f) => ({ ...f, category: v }))} renderInput={(p) => <TextField {...p} label="Category" placeholder="Dessert, Chicken, Breakfast…" />} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete freeSolo options={facets.cuisines.map((c) => c.name)} inputValue={form.cuisine} onInputChange={(_, v) => setForm((f) => ({ ...f, cuisine: v }))} renderInput={(p) => <TextField {...p} label="Cuisine" placeholder="Pakistani, Italian…" />} />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {DIETS.map((d) => (
                      <Chip key={d} label={d} clickable color={diets.includes(d) ? 'primary' : 'default'} variant={diets.includes(d) ? 'filled' : 'outlined'} onClick={() => setDiets((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))} />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Ingredients</Typography>
              <Stack spacing={1.5}>
                {ingredients.map((ing, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <TextField size="small" label="Amount" placeholder="2 cups" value={ing.amount} onChange={(e) => setIng(i, 'amount', e.target.value)} sx={{ width: { xs: 110, sm: 160 } }} inputProps={{ maxLength: 60 }} />
                    <TextField size="small" label={`Ingredient ${i + 1}`} placeholder="flour" fullWidth value={ing.name} onChange={(e) => setIng(i, 'name', e.target.value)} inputProps={{ maxLength: 120 }} />
                    <IconButton aria-label="Remove ingredient" disabled={ingredients.length === 1} onClick={() => setIngredients((l) => l.filter((_, j) => j !== i))}><DeleteOutlineIcon /></IconButton>
                  </Stack>
                ))}
                <Box><Button startIcon={<AddIcon />} onClick={() => setIngredients((l) => [...l, emptyIngredient()])}>Add ingredient</Button></Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Method</Typography>
              <Stack spacing={1.5}>
                {directions.map((step, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ flexShrink: 0, width: 30, height: 30, mt: 1, borderRadius: '50%', bgcolor: 'primary.main', color: '#000', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>{i + 1}</Box>
                    <TextField size="small" fullWidth multiline minRows={2} placeholder={`Step ${i + 1}`} value={step} onChange={(e) => setStep(i, e.target.value)} inputProps={{ maxLength: 2000, 'aria-label': `Step ${i + 1}` }} />
                    <IconButton aria-label="Remove step" disabled={directions.length === 1} onClick={() => setDirections((l) => l.filter((_, j) => j !== i))} sx={{ mt: 0.5 }}><DeleteOutlineIcon /></IconButton>
                  </Stack>
                ))}
                <Box><Button startIcon={<AddIcon />} onClick={() => setDirections((l) => [...l, ''])}>Add step</Button></Box>
              </Stack>
            </CardContent>
          </Card>

          {!editing && cookbooks.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Who can see it?</Typography>
                <Stack spacing={2}>
                  <TextField select label="Add to a family cookbook" value={cookbook} onChange={(e) => setCookbook(e.target.value)} helperText={cookbook ? 'Only cookbook members can see this recipe.' : 'Leave empty to publish on FamFeast for everyone.'}>
                    <MenuItem value="">No, publish publicly</MenuItem>
                    {cookbooks.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </TextField>
                  {cookbook && (
                    <>
                      <TextField label="Family story (optional)" value={form.story} onChange={set('story')} multiline minRows={2} inputProps={{ maxLength: 1000 }} placeholder="Nani always added the saffron last…" />
                      <FormControlLabel control={<Switch checked={publish} onChange={(e) => setPublish(e.target.checked)} />} label="Also publish it on FamFeast for everyone" />
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button color="inherit" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish recipe'}</Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
