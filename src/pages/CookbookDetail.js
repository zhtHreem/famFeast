import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Container, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import KitchenIcon from '@mui/icons-material/Kitchen';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../components/Feedback';
import RecipeGrid from '../components/RecipeGrid';
import EmptyState from '../components/EmptyState';

export default function CookbookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify, confirm } = useFeedback();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  usePageTitle(book?.name || 'Cookbook');

  const load = useCallback(() => {
    api.get(`/cookbooks/${id}`).then((r) => setBook(r.data)).catch((e) => setError(e.response?.status === 404 ? 'not-found' : errorMessage(e)));
  }, [id]);
  useEffect(load, [load]);

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${label} copied`);
    } catch {
      notify(`Could not copy. Your code is ${text}`, 'info');
    }
  };

  const regenerate = async () => {
    if (!(await confirm({ title: 'Generate a new invite code?', text: 'The old code will stop working. Existing members keep their access.', confirmLabel: 'Generate' }))) return;
    try {
      const r = await api.post(`/cookbooks/${id}/regenerate-code`);
      setBook((b) => ({ ...b, inviteCode: r.data.inviteCode }));
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const leave = async () => {
    if (!(await confirm({ title: 'Leave this cookbook?', text: 'You will need a new invite code to rejoin.', confirmLabel: 'Leave', danger: true }))) return;
    try {
      await api.delete(`/cookbooks/${id}/members/${user.id}`);
      notify('You left the cookbook');
      navigate('/cookbooks');
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const removeMember = async (m) => {
    if (!(await confirm({ title: `Remove ${m.username}?`, confirmLabel: 'Remove', danger: true }))) return;
    try {
      await api.delete(`/cookbooks/${id}/members/${m.id}`);
      setBook((b) => ({ ...b, members: b.members.filter((x) => x.id !== m.id) }));
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const destroy = async () => {
    if (!(await confirm({ title: 'Delete this cookbook?', text: 'Family-only recipes inside it will be permanently deleted. Recipes you also published on FamFeast stay public.', confirmLabel: 'Delete cookbook', danger: true }))) return;
    try {
      await api.delete(`/cookbooks/${id}`);
      notify('Cookbook deleted');
      navigate('/cookbooks');
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  if (error === 'not-found') {
    return <Container maxWidth="sm"><EmptyState title="Cookbook not found" text="It may have been deleted, or you are not a member." action={<Button component={Link} to="/cookbooks" variant="contained">My cookbooks</Button>} /></Container>;
  }
  if (error) return <Container sx={{ py: 6 }}><Alert severity="error">{error}</Alert></Container>;
  if (!book) return <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Button component={Link} to="/cookbooks" color="inherit" sx={{ mb: 1 }}>← All cookbooks</Button>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2" component="h1">{book.name}</Typography>
          {book.description && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{book.description}</Typography>}
        </Box>
        <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" useFlexGap>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to={`/recipes/new?cookbook=${id}`}>Add recipe</Button>
          <Button variant="outlined" startIcon={<KitchenIcon />} component={Link} to="/pantry?scope=cookbooks">What can I cook?</Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Members ({book.members.length})</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {book.members.map((m) => (
              <Chip
                key={m.id}
                avatar={<Avatar>{m.username[0].toUpperCase()}</Avatar>}
                label={m.role === 'owner' ? `${m.username} (owner)` : m.username}
                component={Link}
                to={`/profile/${m.id}`}
                clickable
                onDelete={book.isOwner && m.role !== 'owner' ? () => removeMember(m) : undefined}
              />
            ))}
          </Stack>
        </Paper>

        {book.isOwner && (
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Invite family</Typography>
            <TextField
              size="small"
              fullWidth
              value={book.inviteCode}
              inputProps={{ readOnly: true, 'aria-label': 'Invite code', style: { letterSpacing: 4, fontWeight: 700, fontSize: 18 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy invite message"><IconButton aria-label="Copy invite" onClick={() => copy(`Join our family cookbook "${book.name}" on FamFeast! Sign up, then use invite code ${book.inviteCode}: ${window.location.origin}/cookbooks`, 'Invite')}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="New code"><IconButton aria-label="Generate new code" onClick={regenerate}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary">Share this code only with people you trust.</Typography>
          </Paper>
        )}
      </Stack>

      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Recipes ({book.recipes.length})</Typography>
      {book.recipes.length === 0 ? (
        <EmptyState icon={<MenuBookIcon />} title="No recipes yet" text="Add the first family recipe. Photos of handwritten cards work great." action={<Button variant="contained" component={Link} to={`/recipes/new?cookbook=${id}`}>Add the first recipe</Button>} />
      ) : (
        <RecipeGrid recipes={book.recipes} />
      )}

      <Box sx={{ mt: 6 }}>
        {book.isOwner ? (
          <Button color="error" onClick={destroy}>Delete cookbook</Button>
        ) : (
          <Button color="error" onClick={leave}>Leave cookbook</Button>
        )}
      </Box>
    </Container>
  );
}
