import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#F8F9FA', // Off-White/Light Gray
    },
    primary: {
      main: '#0A2540', // Deep Blue
    },
    secondary: {
      main: '#00B4D8', // Vibrant Teal/Cyan
    },
    text: {
      primary: '#212529', // Dark Charcoal Gray
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'Lato, sans-serif',
    },
    body2: {
        fontFamily: 'Lato, sans-serif',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
        containedPrimary: {
          color: '#ffffff',
        },
        outlinedPrimary: {
          borderColor: '#0A2540',
          color: '#0A2540',
          '&:hover': {
            backgroundColor: '#0A2540',
            color: '#ffffff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #EAEAEA',
          boxShadow: 'none',
          padding: '16px',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          },
        },
      },
    },
  },
});

export default theme;
