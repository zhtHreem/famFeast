import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, Stack, TextField, Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import api, { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import { useFeedback } from '../components/Feedback';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { CookbookCardsSkeleton } from '../components/Skeletons';

function PromptDialog({ open, title, fields, submitLabel, onClose, onSubmit }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({});
      setError('');
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {fields.map((f) => (
              <TextField key={f.name} autoFocus={f.autoFocus} label={f.label} required={f.required} multiline={f.multiline} minRows={f.multiline ? 2 : undefined} value={values[f.name] || ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: f.upper ? e.target.value.toUpperCase() : e.target.value }))} inputProps={{ maxLength: f.max || 100 }} helperText={f.help} />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button color="inherit" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={busy}>{submitLabel}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function Cookbooks() {
  usePageTitle('Family cookbooks');
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const [books, setBooks] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState(null); // 'create' | 'join'

  useEffect(() => {
    setError('');
    api.get('/cookbooks').then((r) => setBooks(r.data)).catch((e) => setError(errorMessage(e, 'Could not load your cookbooks.')));
  }, [attempt]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h2" component="h1">Family cookbooks</Typography>
          <Typography color="text.secondary">Private recipe collections shared only with the people you invite.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<VpnKeyIcon />} onClick={() => setDialog('join')}>Join with code</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog('create')}>New cookbook</Button>
        </Stack>
      </Stack>

      {error && <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />}
      {!books && !error && <CookbookCardsSkeleton />}

      {books?.length === 0 && (
        <EmptyState icon={<GroupsIcon />} title="No cookbooks yet" text="Create one for your family, then share the invite code so everyone can add their favourite dishes. Or join one with a code you received." action={<Button variant="contained" onClick={() => setDialog('create')}>Create your first cookbook</Button>} />
      )}

      <Grid container spacing={3}>
        {books?.map((b) => (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to={`/cookbooks/${b.id}`} sx={{ height: '100%', p: 1 }}>
                <CardContent>
                  <GroupsIcon color="primary" sx={{ fontSize: 36 }} />
                  <Typography variant="h5" component="h2" sx={{ mt: 1 }}>{b.name}</Typography>
                  {b.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{b.description}</Typography>}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip size="small" label={`${b.memberCount} member${b.memberCount === 1 ? '' : 's'}`} />
                    {b.role === 'owner' && <Chip size="small" color="secondary" label="Owner" />}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PromptDialog
        open={dialog === 'create'}
        title="New family cookbook"
        submitLabel="Create"
        fields={[
          { name: 'name', label: 'Cookbook name', required: true, autoFocus: true, max: 80, help: 'e.g. Sunday Supper Club' },
          { name: 'description', label: 'Description (optional)', multiline: true, max: 500 },
        ]}
        onClose={() => setDialog(null)}
        onSubmit={async (v) => {
          const r = await api.post('/cookbooks', v);
          notify('Cookbook created. Share the invite code with your family!');
          navigate(`/cookbooks/${r.data.id}`);
        }}
      />
      <PromptDialog
        open={dialog === 'join'}
        title="Join a cookbook"
        submitLabel="Join"
        fields={[{ name: 'code', label: 'Invite code', required: true, autoFocus: true, upper: true, max: 20, help: 'Ask the cookbook owner for the 8-character code' }]}
        onClose={() => setDialog(null)}
        onSubmit={async (v) => {
          const r = await api.post('/cookbooks/join', v);
          notify(`Welcome to ${r.data.name}!`);
          navigate(`/cookbooks/${r.data.id}`);
        }}
      />
    </Container>
  );
}
