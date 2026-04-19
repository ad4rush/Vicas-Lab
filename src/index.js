import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

import 'fontsource-poppins';
import 'fontsource-montserrat';
import 'fontsource-inter';
import 'fontsource-lato';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

