import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, IconButton, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api, { errorMessage } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useFeedback } from './Feedback';
import ErrorState from './ErrorState';
import { CommentsSkeleton } from './Skeletons';

const ago = (date) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(date)) / 1000));
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [name, secs] of units) if (s >= secs) return `${Math.floor(s / secs)} ${name}${Math.floor(s / secs) > 1 ? 's' : ''} ago`;
  return 'just now';
};

function Person({ name, userId, date }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', color: '#000', fontSize: 14, fontWeight: 700 }}>{name?.[0]?.toUpperCase()}</Avatar>
      {userId ? (
        <MuiLink component={Link} to={`/profile/${userId}`} underline="hover" color="inherit" sx={{ fontWeight: 700 }}>{name}</MuiLink>
      ) : (
        <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
      )}
      <Typography variant="caption" color="text.secondary">{ago(date)}</Typography>
    </Stack>
  );
}

export default function Comments({ recipeId, recipeOwnerId }) {
  const { user } = useAuth();
  const { notify, confirm } = useFeedback();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus('loading');
    api
      .get('/comments', { params: { recipeId } })
      .then((r) => {
        setComments(r.data);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [recipeId, attempt]);

  const post = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const r = await api.post('/comments', { recipeId, text });
      setComments((c) => [r.data, ...c]);
      setText('');
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reply = async (id) => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      const r = await api.post(`/comments/${id}/replies`, { text: replyText });
      setComments((c) => c.map((x) => (x._id === id ? r.data : x)));
      setReplyTo(null);
      setReplyText('');
    } catch (e) {
      notify(errorMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!(await confirm({ title: 'Delete this comment?', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await api.delete(`/comments/${id}`);
      setComments((c) => c.filter((x) => x._id !== id));
    } catch (e) {
      notify(errorMessage(e), 'error');
    }
  };

  return (
    <Box component="section" aria-label="Comments">
      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Comments ({comments.length})</Typography>

      {user ? (
        <Stack spacing={1} sx={{ mb: 3 }}>
          <TextField multiline minRows={2} placeholder="Share your thoughts or tips…" value={text} onChange={(e) => setText(e.target.value)} inputProps={{ maxLength: 1000, 'aria-label': 'Write a comment' }} />
          <Box><Button variant="contained" disabled={!text.trim() || busy} onClick={post}>Post comment</Button></Box>
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/login" state={{ from: window.location.pathname }}>Log in</MuiLink> to join the conversation.
        </Typography>
      )}

      {status === 'loading' && <CommentsSkeleton />}
      {status === 'error' && <ErrorState compact title="Comments didn't load" onRetry={() => setAttempt((a) => a + 1)} />}
      {status === 'ok' && (
      <Stack spacing={2.5}>
        {comments.map((c) => (
          <Box key={c._id}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Person name={c.name} userId={c.user} date={c.createdAt} />
              {user && (c.user === user.id || recipeOwnerId === user.id) && (
                <IconButton size="small" aria-label="Delete comment" onClick={() => remove(c._id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
              )}
            </Stack>
            <Typography sx={{ mt: 0.5, ml: 5.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.text}</Typography>

            {c.replies?.map((r) => (
              <Box key={r._id} sx={{ ml: 5.5, mt: 1.5, pl: 2 }}>
                <Person name={r.name} userId={r.user} date={r.createdAt} />
                <Typography sx={{ mt: 0.5, ml: 5.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.text}</Typography>
              </Box>
            ))}

            {user && (
              <Box sx={{ ml: 5.5, mt: 0.5 }}>
                {replyTo === c._id ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                    <TextField size="small" fullWidth autoFocus placeholder="Write a reply…" value={replyText} onChange={(e) => setReplyText(e.target.value)} inputProps={{ maxLength: 1000 }} />
                    <Button variant="contained" size="small" disabled={!replyText.trim() || busy} onClick={() => reply(c._id)}>Reply</Button>
                    <Button size="small" color="inherit" onClick={() => setReplyTo(null)}>Cancel</Button>
                  </Stack>
                ) : (
                  <Button size="small" color="inherit" onClick={() => { setReplyTo(c._id); setReplyText(''); }}>Reply</Button>
                )}
              </Box>
            )}
          </Box>
        ))}
        {comments.length === 0 && <Typography color="text.secondary">No comments yet. Be the first!</Typography>}
      </Stack>
      )}
    </Box>
  );
}
