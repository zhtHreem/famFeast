import React, { useState } from "react";
import { Stack,  Box,Drawer, IconButton, Typography, Button, TextField, List, ListItemButton, ListItemText, Divider } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ACCENT } from "../../theme";
import useImagesReady from "../../hooks/useImagesReady";

const NAV_ART = [
  require("../../images/black.opt.webp"),
  require("../../images/s1.opt.webp"),
  require("../../images/l1.opt.webp"),
  require("../../images/gold-nav.opt.webp"),
];

// Original FamFeast navbar look. Login now comes from AuthContext; menu links live in the right-hand drawer.
export default function Navbar() {
  const { user, logout } = useAuth();
  const isAuthenticated = Boolean(user);
  const userId = user?.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const artReady = useImagesReady(NAV_ART);

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const performSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(searchTerm.trim())}`);
      setDrawerOpen(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  };

  const go = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const menu = [
    { label: 'Recipes', path: '/recipes' },
    { label: 'What can I cook?', path: '/pantry' },
    { label: 'Family cookbooks', path: '/cookbooks' },
    ...(isAuthenticated ? [{ label: 'Add a recipe', path: '/recipes/new' }, { label: 'Saved recipes', path: '/saved' }] : []),
  ];


  return (
    <>
      <Box position="relative" sx={{ backgroundColor: "black", py: 2, px:{xs:1 ,sm:3}, overflow: 'hidden' }}>
        {/* Decorations fade in together once every image has loaded (no piece-by-piece pop-in) */}
        <Box sx={{ opacity: artReady ? 1 : 0, transition: "opacity .7s ease" }}>
        {/* Background images */}
        <Box component="img" src={require("../../images/black.opt.webp")} sx={{ width: { xs: '90%', lg: '90%' }, height: { xs: '110%' }, opacity: 0.2, objectFit: 'cover', position: 'absolute', left: { lg: "10%" }, zIndex: 1, transform: 'rotate(180deg)', userSelect: 'none', pointerEvents: 'none' }} />
        <Box component="img" src={require("../../images/black.opt.webp")} sx={{ width: { xs: '90%', lg: '90%' }, height: { xs: '110%' }, opacity: 0.2, objectFit: 'cover', position: 'absolute', right: { lg: "10%" }, zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
        {/* Other background images */}
        <Box component="img" src={require("../../images/s1.opt.webp")} sx={{ width: { xs: '60%', lg: '100%' }, height: { xs: '80%', lg: '80%' }, objectFit: 'contain', position: 'absolute', bottom: { xs: "20%", sm: '20%', md: "24%", lg: '17%' }, right: { xs: '64%', sm: '67%', md: '68%', lg: '48%' }, zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
        <Box component="img" src={require("../../images/l1.opt.webp")} sx={{ width: { xs: '60%', lg: '90%' }, height: { xs: '55%', lg: '80%' }, objectFit: 'contain', position: 'absolute', bottom: { xs: "53%", lg: '23%' }, right: { xs: '34%', sm: '36%', md: '47%', lg: '38%' }, zIndex: 1, transform: 'rotate(320deg)', userSelect: 'none', pointerEvents: 'none' }} />
        <Box component="img" src={require("../../images/l1.opt.webp")} sx={{ width: { xs: '110%', lg: '110%' }, height: { xs: '30%', lg: '40%' }, objectFit: 'contain', position: 'absolute', bottom: { xs: "6%", sm: '15%', lg: '6%' }, right: { xs: '43%', sm: '34%', md: '37%', lg: '40%' }, zIndex: 1, transform: 'rotate(45deg)', userSelect: 'none', pointerEvents: 'none' }} />
        <Box component="img" src={require("../../images/l1.opt.webp")} sx={{ width: { xs: '110%', lg: '110%' }, height: { xs: '18%', lg: '20%' }, objectFit: 'contain', position: 'absolute', bottom: { xs: "27%", sm: '33%', lg: '30%' }, right: { xs: '43%', sm: '36%', md: '38%', lg: '41%' }, zIndex: 1, userSelect: 'none', pointerEvents: 'none' }} />
        <Box component="img" src={require("../../images/gold-nav.opt.webp")} sx={{ width: { xs: '60%', lg: '40%' }, height: { xs: '70%', lg: '100%' }, objectFit: 'cover', position: 'absolute', bottom: { xs: "100%", md: '160%', lg: '170%' }, left: { xs: '45%', md: '47%', lg: '65%' }, zIndex: 1, transform: 'rotate(50deg)', userSelect: 'none', pointerEvents: 'none' }} />
        </Box>
        <Stack direction={"row"} sx={{ color: "white", justifyContent: "space-between" }}>
          <Stack direction="row" sx={{ alignItems: "center" }}>
 
            <Box display="flex" flexDirection="column" marginLeft={{xs:1,sm:10}} position="relative">
            <Typography color="white" fontWeight="Bold" fontFamily="Questrial" sx={{color:"lightgrey",position:"absolute"}}  variant="h6">Fam</Typography>
            <Typography color="white" fontWeight="Bold" fontFamily="Questrial"  variant="h4" marginTop={2}>
               <span>F</span>
               <span style={{fontFamily:"Blaka",color:ACCENT}}> E </span>
               <span>A</span>
               <span>S</span>
               <span>T</span>
            </Typography>
            </Box>
         
          </Stack>
          <Stack direction="row" spacing={{xs:1,sm:2}} alignItems="center">
            <Button onClick={()=>navigate("/")}  sx={{ color: "white",textDecoration: "none",fontWeight: "bold" }} >Home</Button>
            <Button onClick={()=>navigate("/pantry")}  sx={{ color: "white",textDecoration: "none",fontWeight: "bold", display: { xs: "none", sm: "inline-flex" } }} >Pantry</Button>
            <Button onClick={()=>navigate("/recipes")}  sx={{ color: "white",textDecoration: "none",fontWeight: "bold", display: { xs: "none", md: "inline-flex" } }} >Recipes</Button>
            <Button onClick={()=>navigate("/cookbooks")}  sx={{ color: "white",textDecoration: "none",fontWeight: "bold", display: { xs: "none", md: "inline-flex" } }} >Cookbooks</Button>
            {isAuthenticated && (
              <Button  onClick={() => navigate(`/profile/${userId}`)} sx={{ color: "white",textDecoration: "none" ,fontWeight: "bold"}} >Profile</Button>
            )}

            <IconButton size="small" onClick={() => setDrawerOpen(true)}>
              <SearchIcon fontSize="medium" sx={{ color: "white" }} />
            </IconButton>

             {/* Drawer with Search Field */}
      <Drawer
        anchor="right" // Drawer will slide in from the right side
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '.MuiDrawer-paper': {
            backgroundColor: '#403f3f', // Change this to your desired color
            color: 'white', // Optional: Change text color if needed
          },
        }}
      >
        <Box
          sx={{
            width: 250, // Width of the drawer
            padding: 2,
            backgroundColor: 'grey', // Background color of the drawer
          }}
        >
          <TextField
            id="standard-search"
            label="Search field"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={handleKeyDown} // Handle Enter key press
            type="search"
            size="small"
            variant="standard"
            fullWidth
            autoFocus // Focus the input when the drawer opens
             sx={{ color: "white", textDecorationColor: "white" }}
          />
          <Divider sx={{ my: 1.5 }} />
          <List dense>
            {menu.map((m) => (
              <ListItemButton key={m.path} onClick={() => go(m.path)}><ListItemText primary={m.label} /></ListItemButton>
            ))}
            {isAuthenticated && <ListItemButton onClick={() => go(`/profile/${userId}`)}><ListItemText primary="My profile" /></ListItemButton>}
          </List>
        </Box>
      </Drawer>
            
            {!isAuthenticated ? (
              <Button onClick={() => navigate("/login")} sx={{  fontWeight:"bold" , color: ACCENT,'&:hover': { color: 'white',fontWeight:"bold" }, }}>Login</Button>
            ) : (
              <Button size="small"onClick={handleLogout} sx={{  fontWeight:"bold" , color: ACCENT,'&:hover': { color: 'white',fontWeight:"bold"  }, }}>Logout</Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
