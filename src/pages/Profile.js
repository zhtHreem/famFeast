import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItemAvatar,
  ListItemButton, ListItemText, Paper, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedIcon from '@mui/icons-material/Verified';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from '../components/Feedback';
import RecipeGrid from '../components/RecipeGrid';
import EmptyState from '../components/EmptyState';
import { LEAF_GOLD, LEAF_OLIVE, LEAF_CREAM } from '../components/leafImages';

const PAGE = 12;

function PeopleList({ people, empty }) {
  if (!people) return <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress /></Box>;
  if (!people.length) return <EmptyState title={empty} />;
  return (
    <List sx={{ maxWidth: 560 }}>
      {people.map((p) => (
        <ListItemButton key={p.id} component={Link} to={`/profile/${p.id}`} sx={{ borderRadius: 3 }}>
          <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700 }}>{p.username[0].toUpperCase()}</Avatar></ListItemAvatar>
          <ListItemText primary={p.username} secondary={p.bio} secondaryTypographyProps={{ noWrap: true }} />
        </ListItemButton>
      ))}
    </List>
  );
}

function StatTile({ value, label, onClick }) {
  return (
    <Paper
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && e.key === 'Enter' && onClick()}
      sx={{ px: 2.5, py: 1.25, minWidth: 96, textAlign: 'center', borderRadius: 3, cursor: onClick ? 'pointer' : 'default', '&:hover': onClick ? { bgcolor: '#251818' } : undefined }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '1.35rem', lineHeight: 1.2 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user, updateProfile } = useAuth();
  const { notify } = useFeedback();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [recipes, setRecipes] = useState(null); // { items, total, page, pages }
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState('recipes');
  const [people, setPeople] = useState({ followers: null, following: null });
  const [saved, setSaved] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ username: '', bio: '' });
  const [busy, setBusy] = useState(false);

  const isMe = user?.id === id;
  usePageTitle(profile?.username || 'Profile');

  const load = useCallback(() => {
    api.get(`/users/${id}`).then((r) => setProfile(r.data)).catch((e) => setError(e.response?.status === 404 || e.response?.status === 400 ? 'not-found' : errorMessage(e)));
  }, [id]);

  useEffect(() => {
    setProfile(null);
    setError('');
    setRecipes(null);
    setTab('recipes');
    setPeople({ followers: null, following: null });
    setSaved(null);
    load();
    api.get(`/recipes/user/${id}`, { params: { limit: PAGE } }).then((r) => setRecipes(r.data)).catch(() => setRecipes({ items: [], total: 0, page: 1, pages: 1 }));
  }, [id, load]);

  useEffect(() => {
    if (tab === 'followers' && !people.followers) api.get(`/users/${id}/follower`).then((r) => setPeople((p) => ({ ...p, followers: r.data.followers }))).catch(() => {});
    if (tab === 'following' && !people.following) api.get(`/users/${id}/following`).then((r) => setPeople((p) => ({ ...p, following: r.data.following }))).catch(() => {});
    if (tab === 'saved' && !saved) api.get('/me/saved').then((r) => setSaved(r.data)).catch(() => setSaved([]));
  }, [tab, id, people, saved]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const r = await api.get(`/recipes/user/${id}`, { params: { limit: PAGE, page: recipes.page + 1 } });
      setRecipes((cur) => ({ ...r.data, items: [...cur.items, ...r.data.items] }));
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const following = Boolean(user && profile?.followerIds?.includes(user.id));

  const toggleFollow = async () => {
    if (!user) return notify('Log in to follow people.', 'info');
    try {
      await api.post(`/${following ? 'unfollow' : 'follow'}/${id}`);
      setPeople({ followers: null, following: null });
      load();
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  const saveProfile = async () => {
    setBusy(true);
    try {
      await updateProfile({ username: draft.username, bio: draft.bio });
      notify('Profile updated');
      setEditing(false);
      load();
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (error === 'not-found') return <Container maxWidth="sm"><EmptyState title="User not found" action={<Button component={Link} to="/recipes" variant="contained">Browse recipes</Button>} /></Container>;
  if (error) return <Container sx={{ py: 6 }}><Alert severity="error">{error}</Alert></Container>;
  if (!profile) return <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}><CircularProgress /></Box>;

  const official = profile.username === 'FamFeast';

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Cover */}
      <Box sx={{ position: 'relative', height: { xs: 130, md: 190 }, borderRadius: { xs: 3, md: 5 }, overflow: 'hidden', background: 'linear-gradient(135deg, #1d2616 0%, #1B1212 55%, #0d0d0d 100%)' }}>
        {[LEAF_OLIVE, LEAF_GOLD, LEAF_CREAM, LEAF_OLIVE, LEAF_GOLD].map((src, i) => (
          <Box key={i} component="img" alt="" src={src} sx={{ position: 'absolute', width: 54 + i * 14, opacity: 0.16, top: `${10 + ((i * 29) % 55)}%`, left: `${8 + i * 20}%`, transform: `rotate(${i * 67}deg)` }} />
        ))}
      </Box>

      {/* Identity */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1.5, md: 3 }} alignItems={{ xs: 'center', md: 'flex-end' }} sx={{ px: { md: 4 }, mt: { xs: -7, md: -8 }, position: 'relative', textAlign: { xs: 'center', md: 'left' } }}>
        <Avatar sx={{ width: { xs: 112, md: 136 }, height: { xs: 112, md: 136 }, fontSize: { xs: 48, md: 58 }, fontWeight: 700, bgcolor: 'primary.main', color: '#000', border: '5px solid #000' }}>
          {profile.username[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, pb: { md: 1 } }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap" useFlexGap>
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' } }}>{profile.username}</Typography>
            {official && <Chip icon={<VerifiedIcon />} label="Official" color="primary" size="small" />}
          </Stack>
          {profile.bio && <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>{profile.bio}</Typography>}
          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 1, color: 'text.secondary' }}>
            <CalendarMonthIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Typography>
          </Stack>
        </Box>
        <Box sx={{ pb: { md: 1 } }}>
          {isMe ? (
            <Button variant="outlined" onClick={() => { setDraft({ username: profile.username, bio: profile.bio }); setEditing(true); }}>Edit profile</Button>
          ) : (
            <Button variant={following ? 'outlined' : 'contained'} onClick={toggleFollow} size="large">{following ? 'Following' : 'Follow'}</Button>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3, px: { md: 4 } }}>
        <StatTile value={profile.recipeCount} label="Recipes" onClick={() => setTab('recipes')} />
        <StatTile value={profile.followers} label="Followers" onClick={() => setTab('followers')} />
        <StatTile value={profile.following} label="Following" onClick={() => setTab('following')} />
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mt: 4, mb: 3 }}>
        <Tab value="recipes" label="Recipes" />
        {isMe && <Tab value="saved" label="Saved" />}
        <Tab value="followers" label="Followers" />
        <Tab value="following" label="Following" />
      </Tabs>

      {tab === 'recipes' && (
        recipes && recipes.items.length === 0 ? (
          <EmptyState title={isMe ? "You haven't shared a recipe yet" : 'No public recipes yet'} action={isMe && <Button component={Link} to="/recipes/new" variant="contained">Add your first recipe</Button>} />
        ) : (
          <>
            <RecipeGrid recipes={recipes?.items || []} loading={!recipes} skeletons={4} />
            {recipes && recipes.page < recipes.pages && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button variant="outlined" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading…' : `Show more (${recipes.total - recipes.items.length} left)`}</Button>
              </Box>
            )}
          </>
        )
      )}
      {tab === 'saved' && (saved && saved.length === 0 ? <EmptyState title="Nothing saved yet" text="Tap Save on any recipe to keep it here." action={<Button component={Link} to="/recipes" variant="contained">Browse recipes</Button>} /> : <RecipeGrid recipes={saved || []} loading={!saved} skeletons={4} />)}
      {tab === 'followers' && <PeopleList people={people.followers} empty="No followers yet" />}
      {tab === 'following' && <PeopleList people={people.following} empty="Not following anyone yet" />}

      <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Username" value={draft.username} onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))} inputProps={{ maxLength: 30 }} />
            <TextField label="Bio" value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} multiline minRows={3} inputProps={{ maxLength: 300 }} helperText={`${draft.bio.length}/300`} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button color="inherit" onClick={() => setEditing(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveProfile} disabled={busy}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
