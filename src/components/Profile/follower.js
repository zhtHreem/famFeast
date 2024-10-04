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

const Follower = ({ userId, setOpenFollower }) => {
  const [follower, setFollower] = useState([]); const [loading, setLoading] = useState(true);
  const paperRef = useRef(null);

  useEffect(() => { fetchFollower(userId); }, [userId]);

  const fetchFollower = async (userId) => {
    Swal.fire({ title: 'Loading...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    try {
      const response = await axios.get(`https://fam-feast-api.vercel.app/api/users/${userId}/follower`);
      setFollower(response.data.followers || []); Swal.close();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Something went wrong! Please try again later.' });
    } finally { setLoading(false); }
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paperRef.current && !paperRef.current.contains(event.target)) {
        setOpenFollower(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [setOpenFollower]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ position: "relative", zIndex: 100 }}>
      <Paper ref={paperRef} elevation={20} sx={{ padding: { xs: 2, sm: 3, md: 4 }, width: { xs: '90%', sm: '300px', md: '400px' }, maxWidth: '90vw', borderRadius: 2 }}>
        <IconButton onClick={(e) => { e.stopPropagation(); setOpenFollower(false); }} sx={{ marginLeft: 'auto', display: 'block' }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom align="center">Follower</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : follower.length > 0 ? (
          <List>
            {follower.map(follow => (
              <StyledListItem key={follow._id} component="a" href={`/profile/${follow._id}`} target="_self">
                <PersonIcon sx={{ marginRight: 1 }} />
                <ListItemText primary={follow.username} />
              </StyledListItem>
            ))}
          </List>
        ) : (
          <Typography align="center">No followers yet</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Follower;
