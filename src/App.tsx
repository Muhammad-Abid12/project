import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  shape: { borderRadius: 8 },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MessagingProvider>
          <Router>
            <AppRoutes />
          </Router>
        </MessagingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}