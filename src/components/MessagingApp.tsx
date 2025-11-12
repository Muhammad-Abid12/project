import { Box } from '@mui/material';
import Navbar from './Navbar';
import { Sidebar } from './Sidebar';
import { ForumView } from './ForumView';
import { ChatView } from './ChatView';
import { useMessaging } from '../contexts/MessagingContext';

export default function MessagingApp() {
    const { viewMode } = useMessaging();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Navbar />
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar />
                {viewMode === 'forum' ? <ForumView /> : <ChatView />}
            </Box>
        </Box>
    );
}