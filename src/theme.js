import { createTheme } from '@mui/material/styles';

// Calm herb-green accent on black, with cream for secondary highlights.
export const ACCENT = '#9DBE7A';
export const CREAM = '#F3E9D2';

// Fraunces (soft serif) for headings, DM Sans for everything else. Both ship real weights,
// so bold text is genuinely bold instead of a browser-faked Questrial. The logo wordmark keeps Questrial/Blaka.
const HEADING = '"Fraunces", Georgia, "Times New Roman", serif';
const BODY = '"DM Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

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
    fontFamily: BODY,
    h1: { fontFamily: HEADING, fontWeight: 600, fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', lineHeight: 1.1, letterSpacing: '-0.01em' },
    h2: { fontFamily: HEADING, fontWeight: 600, fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', lineHeight: 1.15, letterSpacing: '-0.01em' },
    h3: { fontFamily: HEADING, fontWeight: 600, fontSize: 'clamp(1.45rem, 3.5vw, 2rem)', lineHeight: 1.2 },
    h4: { fontFamily: HEADING, fontWeight: 600, fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', lineHeight: 1.25 },
    h5: { fontFamily: HEADING, fontWeight: 600, lineHeight: 1.3 },
    h6: { fontFamily: HEADING, fontWeight: 600, lineHeight: 1.35 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 700 },
    body1: { lineHeight: 1.65 },
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
