import React, { useState } from 'react';
import { Alert, Box, Button, Container, IconButton, InputAdornment, Link as MuiLink, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../auth/AuthContext';
import { errorMessage } from '../api';
import usePageTitle from '../hooks/usePageTitle';
import Logo from '../components/Logo';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  usePageTitle(isRegister ? 'Sign up' : 'Log in');
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister && form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true);
    try {
      if (isRegister) await register(form.username.trim(), form.email.trim(), form.password);
      else await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack alignItems="center" spacing={0.5} sx={{ mb: 3 }}>
          <Logo size="lg" />
          <Typography color="text.secondary">{isRegister ? 'Create your free account' : 'Welcome back'}</Typography>
        </Stack>

        <Box component="form" onSubmit={submit} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {isRegister && (
              <TextField label="Username" value={form.username} onChange={set('username')} required autoComplete="username" helperText="3-30 characters: letters, numbers, _ or ." />
            )}
            <TextField label="Email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
            <TextField
              label="Password"
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              helperText={isRegister ? 'At least 8 characters' : undefined}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} edge="end">
                      {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
            </Button>
          </Stack>
        </Box>

        <Typography sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
          {isRegister ? 'Already have an account? ' : "New to FamFeast? "}
          <MuiLink component={Link} to={isRegister ? '/login' : '/register'} state={location.state} underline="hover">
            {isRegister ? 'Log in' : 'Sign up'}
          </MuiLink>
        </Typography>
      </Paper>
    </Container>
  );
}
