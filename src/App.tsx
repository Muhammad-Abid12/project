import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { MessagingProvider, useMessaging } from './contexts/MessagingContext';
import { Sidebar } from './components/Sidebar';
import { ForumView } from './components/ForumView';
import { ChatView } from './components/ChatView';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

function MessagingApp() {
  const { viewMode } = useMessaging();

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      {viewMode === 'forum' ? <ForumView /> : <ChatView />}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MessagingProvider>
        <MessagingApp />
      </MessagingProvider>
    </ThemeProvider>
  );
}

export default App;
