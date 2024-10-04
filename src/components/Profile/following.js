import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles'; 
import PersonIcon from '@mui/icons-material/Person'; 
import CloseIcon from '@mui/icons-material/Close';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '8px', marginBottom: '8px', backgroundColor: theme.palette.background.paper,
  transition: 'background-color 0.3s', '&:hover': { backgroundColor: theme.palette.action.hover, cursor: 'pointer' },
}));

const Following = ({ userId, setOpenFollowing }) => {
  const [following, setFollowing] = useState([]); const [loading, setLoading] = useState(true);
  const paperRef = useRef(null);

  useEffect(() => { fetchFollowing(userId); }, [userId]);

  const fetchFollowing = async (userId) => {
    Swal.fire({ title: 'Loading...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    try {
      const response = await axios.get(`https://fam-feast-api.vercel.app/api/users/${userId}/following`);
      setFollowing(response.data.following || []); Swal.close();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Something went wrong! Please try again later.' });
    } finally { setLoading(false); }
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paperRef.current && !paperRef.current.contains(event.target)) {
        setOpenFollowing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [setOpenFollowing]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ zIndex: 100 }}>
      <Paper ref={paperRef} elevation={20} sx={{ padding: { xs: 2, sm: 4 }, width: { xs: '90%', sm: '400px', md: '500px' }, maxWidth: '90vw', borderRadius: 2 }}>
        <IconButton onClick={(e) => { e.stopPropagation(); setOpenFollowing(false); }} sx={{ marginLeft: 'auto', display: 'block' }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom align="center">Following</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : following.length > 0 ? (
          <List>
            {following.map(follow => (
              <StyledListItem key={follow._id} component="a" href={`/profile/${follow._id}`} target="_self">
                <PersonIcon sx={{ marginRight: 1 }} />
                <ListItemText primary={follow.username} />
              </StyledListItem>
            ))}
          </List>
        ) : (
          <Typography align="center">No following yet</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Following;
