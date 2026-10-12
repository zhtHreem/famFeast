import { createTheme } from '@mui/material/styles';

// Calm herb-green accent on black, with cream for secondary highlights.
export const ACCENT = '#9DBE7A';
export const CREAM = '#F3E9D2';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: ACCENT, contrastText: '#000' },
    secondary: { main: CREAM, contrastText: '#000' },
    background: { default: '#000000', paper: '#1B1212' },
    text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.7)' },
    divider: 'rgba(255,255,255,0.06)',
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Questrial", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: 'clamp(2.2rem, 6vw, 4rem)', lineHeight: 1.1 },
    h2: { fontWeight: 700, fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', lineHeight: 1.15 },
    h3: { fontWeight: 700, fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)' },
    h4: { fontWeight: 700, fontSize: 'clamp(1.3rem, 3vw, 1.7rem)' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#000' },
        '@media (prefers-reduced-motion: reduce)': { '*': { animation: 'none !important', transition: 'none !important' } },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 999, paddingInline: 20 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none', borderRadius: 16 } } },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'medium' } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: 'rgba(255,255,255,0.04)' } } },
  },
});

export default theme;
