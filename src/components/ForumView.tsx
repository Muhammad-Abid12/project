import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Avatar,
} from '@mui/material';
import { Send, PushPin } from '@mui/icons-material';
import { useMessaging } from '../contexts/MessagingContext';
import { MessageThread } from './MessageThread';

export const ForumView = () => {
  const { selectedForum, currentUser, messages, postMessage } = useMessaging();
  const [newMessage, setNewMessage] = useState('');

  if (!selectedForum) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a forum to view discussions
        </Typography>
      </Box>
    );
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedForum) {
      await postMessage(selectedForum.id, newMessage);
      setNewMessage('');
    }
  };
  const handleReply = async (parentId: string, content: string) => {
    if (selectedForum) {
      await postMessage(selectedForum.id, content, parentId);
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {selectedForum.isPinned && <PushPin fontSize="small" color="primary" />}
          <Typography variant="h5" fontWeight={700}>
            {selectedForum.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedForum.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {selectedForum.tags?.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={selectedForum.author.avatar} sx={{ width: 24, height: 24 }}>
              {selectedForum.author.username[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Created by {selectedForum.author.username}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {selectedForum.messageCount} messages
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <MessageThread key={message.id} message={message} onReply={handleReply} />
        ))}
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar src={currentUser.avatar} sx={{ width: 40, height: 40 }}>
            {currentUser.username[0]}
          </Avatar>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Share your thoughts..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ minWidth: 100 }}
            startIcon={<Send />}
          >
            Post
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
